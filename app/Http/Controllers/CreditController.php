<?php

    namespace App\Http\Controllers;

    use Illuminate\Http\Request;
    use App\Models\UserCredit;
    use App\Models\ApplicantView;
    use App\Models\CreditTransaction;
    use Illuminate\Support\Facades\DB;
    use Illuminate\Support\Facades\Log;

    class CreditController extends Controller
    {
        public function creditDisplay(Request $request)
        {
            $user = auth()->user();

            if (!$user) {
                return redirect()->route('login');
            }

            $credits = $user?->credit?->balance ?? 0;

            // For admins, show all transactions; for regular users, show only their own
            if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
                $credit_transactions = CreditTransaction::with('user')
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $credit_transactions = CreditTransaction::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            // For admin users, also fetch companies for selection
            $companies = null;
            if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
                $companies = \App\Models\User::role('company')
                    ->with('company')
                    ->get()
                    ->map(function ($companyUser) {
                        return [
                            'id' => $companyUser->id,
                            'name' => $companyUser->company?->company_name ?? $companyUser->email,
                            'email' => $companyUser->email,
                        ];
                    });
            }
            $myTopupRequests = [];
            if (!$user->hasRole('admin') && !$user->hasRole('super_admin')) {
                $myTopupRequests = \App\Models\TopupRequest::where('user_id', $user->id)
                    ->latest()->get()
                    ->map(fn($r) => [
                        'id'         => $r->id,
                        'amount'     => $r->amount,
                        'status'     => $r->status,
                        'admin_note' => $r->admin_note,
                        'created_at' => $r->created_at->diffForHumans(),
                        'proof_url' => asset('storage/' . $r->proof_of_payment),
                    ]);
            }
            $topupRequests = [];
            if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
                $topupRequests = \App\Models\TopupRequest::with('user')
                    ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
                    ->orderByDesc('created_at')
                    ->get()
                    ->map(fn($r) => [
                        'id'         => $r->id,
                        'user_email' => $r->user->email,
                        'amount'     => $r->amount,
                        'proof_url'  => \Storage::url($r->proof_of_payment),
                        'status'     => $r->status,
                        'admin_note' => $r->admin_note,
                        'created_at' => $r->created_at->diffForHumans(),
                    ]);
            }

            return inertia('Credits/balancePage', [
                'balance' => $credits,
                'credit_transactions' => $credit_transactions,
                'companies' => $companies,
                'my_topup_requests'   => $myTopupRequests,
                'topup_requests'      => $topupRequests,
            ]);
        }

        public function addCredits(Request $request)
        {
            $user = auth()->user();

            if (!$user) {
                return redirect()->route('login');
            }

            if (!$user->hasRole('admin') && !$user->hasRole('super_admin')) {
                return redirect()->back()->with('error', 'Unauthorized access.');
            }

            $request->validate([
                'user_id' => 'required|exists:users,id',
                'amount' => 'required|numeric|min:1',
            ]);

            $userId = $request->input('user_id');
            $amount = $request->input('amount');

            $targetUser = \App\Models\User::find($userId);
            if (!$targetUser || !$targetUser->hasRole('company')) {
                return redirect()->back()->with('error', 'Invalid company selected.');
            }

            try {
                DB::transaction(function () use ($targetUser, $amount, $user) {

                    // Lock the user's credit row if it exists; otherwise create it and then lock
                    $userCredit = UserCredit::where('user_id', $targetUser->id)->lockForUpdate()->first();
                    if (!$userCredit) {
                        $userCredit = UserCredit::create([
                            'user_id' => $targetUser->id,
                            'balance' => 0,
                        ]);
                        // Lock the newly created record to be safe
                        $userCredit = UserCredit::where('user_id', $targetUser->id)->lockForUpdate()->first();
                    }

                    // Increment balance
                    $userCredit->increment('balance', $amount);

                    // Create the Transaction Record for the target user
                    CreditTransaction::create([
                        'user_id'     => $targetUser->id,
                        'amount'      => $amount,       // Positive number for adding
                        'type'        => 'top_up',      // Different type than 'usage'
                        'description' => "Admin added {$amount} credits to wallet",
                        'metadata'    => json_encode([
                            'method' => 'manual_add',
                            'added_by_admin_id' => $user->id,
                            'timestamp' => now()->toDateTimeString(),
                        ]),
                    ]);
                });

                return redirect()->back()->with('success', 'Credits added successfully!');

            } catch (\Exception $e) {
                Log::error("Add credits failed for user {$user->id}: " . $e->getMessage());
                return redirect()->back()->with('error', 'Failed to add credits. Please try again.');
            }
        }

        public function buyInfo(Request $request, $applicationId)
        {
            $user = auth()->user();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated.',
                ], 401);
            }

            // price
            $cost = 1;

            // Basic permission check
            $application = DB::table('applications')->where('id', $applicationId)->first();

            if (!$application) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Application not found.',
                ], 404);
            }

            $isCompany = $user->hasRole('company');
            $isOwner = isset($application->user_id) && $application->user_id === $user->id;

            if (!($isCompany || $isOwner)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not authorized to purchase this applicant.',
                ], 403);
            }

            $alreadyPurchased = ApplicantView::where('user_id', $user->id)
                ->where('application_id', $applicationId)
                ->where('field_key', 'package')
                ->exists();

            if ($alreadyPurchased) {
                $userCredit = UserCredit::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);
                return response()->json([
                    'status' => 'success',
                    'message' => 'Package already purchased.',
                    'new_balance' => $userCredit->balance,
                    'already_paid' => true,
                ]);
            }

            try {
                $newBalance = null;
                DB::transaction(function () use ($user, $applicationId, $cost, &$newBalance) {
                    $userCredit = UserCredit::where('user_id', $user->id)->lockForUpdate()->first();
                    if (!$userCredit) {
                        $userCredit = UserCredit::create([
                            'user_id' => $user->id,
                            'balance' => 0,
                        ]);
                    }

                    if ($userCredit->balance < $cost) {
                        throw new \Exception("Insufficient credits. Current balance: {$userCredit->balance}");
                    }

                    $userCredit->balance -= $cost;
                    $userCredit->save();

                    ApplicantView::create([
                        'user_id' => $user->id,
                        'application_id' => $applicationId,
                        'field_key' => 'package',
                        'paid' => true,
                    ]);

                    CreditTransaction::create([
                        'user_id' => $user->id,
                        'amount' => -$cost,
                        'type' => 'usage',
                        'description' => "Purchased package (full applicant profile) for application ID: {$applicationId}",
                        'metadata' => json_encode([
                            'application_id' => $applicationId,
                            'package' => true,
                        ]),
                    ]);
                
                    $newBalance = $userCredit->balance;
                });

                return response()->json([
                    'status' => 'success',
                    'message' => "Package purchased. {$cost} credits deducted.",
                    'new_balance' => $newBalance,
                ]);
            } catch (\Exception $e) {
                Log::error("Buy package failed for user {$user->id}, app {$applicationId}: " . $e->getMessage());
                return response()->json([
                    'status' => 'error',
                    'message' => $e->getMessage() ?: 'Failed to process purchase.',
                ], 400);
            }
        }

        public function viewApplicant(Request $request)
        {
            $user = auth()->user(); 
            $applicationId = $request->application_id;
            $cost = 1; 

            $existingView = ApplicantView::where('company_id', $user->id)
                ->where('application_id', $applicationId)
                ->first();

            if ($existingView) {
                return response()->json(['message' => 'You already bought this info.'], 200);
            }

            $application = \App\Models\Application::find($applicationId);
            if (!$application) {
                return response()->json(['message' => 'Application not found.'], 404);
            }

            $credit = UserCredit::where('user_id', $user->id)->first();

            if (!$credit || $credit->balance < $cost) {
                return response()->json(['message' => 'Insufficient balance.'], 400);
            }

            $credit->balance -= $cost;
            $credit->save();

            ApplicantView::create([
                'company_id' => $user->id,
                'user_id' => $application->user_id, 
                'application_id' => $applicationId,
                'field_key' => 'basic_profile',
            ]);

            CreditTransaction::create([
                'user_id' => $user->id,
                'amount' => -$cost,
                'type' => 'purchase_info',
                'description' => "Purchased applicant info (Application ID: {$applicationId})",
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Applicant info purchased successfully.',
                'new_balance' => $credit->balance,
            ]);
        }


        public function checkApplicantView($applicationId)
        {
            $user = auth()->user();

            if (!$user) {
                return response()->json(['error' => 'Not authenticated'], 401);
            }

            $view = ApplicantView::where('company_id', $user->id)
                ->where('application_id', $applicationId)
                ->whereIn('field_key', ['basic_profile', 'package'])
                ->get();

            $paidFields = $view->pluck('field_key')->toArray();

            return response()->json([
                'paid_fields' => $paidFields,
                'already_purchased' => !empty($paidFields),
            ]);
        }


    }
