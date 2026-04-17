<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\UserCredit;
use App\Models\CreditTransaction;
use App\Models\EzCoinLoadHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EzCoinController extends Controller
{
    public static function computeEzCoinCost(float $franchiseFee): int
    {
        if ($franchiseFee <= 150_000) {
            return 200;
        } elseif ($franchiseFee <= 500_000) {
            return 300;
        } elseif ($franchiseFee <= 1_000_000) {
            return 400;
        } else {
            return 500;
        }
    }

    public function index()
    {
        $companies = Company::with(['opportunity', 'user.credit'])
            ->get()
            ->map(function (Company $company) {
                $franchiseFee  = (float) ($company->opportunity?->franchise_fee ?? 0);
                $suggestedCost = self::computeEzCoinCost($franchiseFee);
                $actualCost    = $company->ezcoin_cost > 0 ? $company->ezcoin_cost : $suggestedCost;
                $balance       = $company->user?->credit?->balance ?? 0;

                return [
                    'id'             => $company->id,
                    'company_name'   => $company->company_name,
                    'brand_name'     => $company->brand_name,
                    'status'         => $company->status,
                    'payment_status' => $company->payment_status ?? 'unpaid',
                    'franchise_fee'  => $franchiseFee,
                    'ezcoin_cost'    => $actualCost,
                    'suggested_cost' => $suggestedCost,
                    'agent_name'     => $company->agent_name,
                    'user_balance'   => $balance,
                    'can_afford'     => $balance >= $actualCost,
                ];
            });

        $loadHistories = EzCoinLoadHistory::with(['company', 'admin'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (EzCoinLoadHistory $h) {
                return [
                    'id'            => $h->id,
                    'company_name'  => $h->company?->company_name ?? 'N/A',
                    'ezcoin_loaded' => $h->ezcoin_loaded,
                    'bonus_coins'   => $h->bonus_coins,
                    'total'         => $h->ezcoin_loaded + $h->bonus_coins,
                    'loaded_by'     => $h->loaded_by,
                    'notes'         => $h->notes,
                    'created_at'    => $h->created_at,
                ];
            });

        return Inertia::render('EzCoin/index', [
            'companies'     => $companies,
            'loadHistories' => $loadHistories,
        ]);
    }

    public function updateCost(Request $request, Company $company)
    {
        $request->validate([
            'ezcoin_cost' => 'required|integer|min:0',
        ]);

        $company->update(['ezcoin_cost' => $request->ezcoin_cost]);

        return back()->with('success', "EZCoin cost updated to {$request->ezcoin_cost} for {$company->company_name}.");
    }

    public function resetCost(Company $company)
    {
        $franchiseFee = (float) ($company->opportunity?->franchise_fee ?? 0);
        $suggested    = self::computeEzCoinCost($franchiseFee);

        $company->update(['ezcoin_cost' => $suggested]);

        return back()->with('success', "EZCoin cost reset to {$suggested} for {$company->company_name}.");
    }

    public function payForApproval(Request $request, Company $company)
    {
        $user = auth()->user();

        if ($company->user_id !== $user->id) {
            return back()->with('error', 'Unauthorized.');
        }

        if ($company->status !== 'pending') {
            return back()->with('error', 'Only pending companies can pay for approval.');
        }

        if ($company->payment_status === 'paid') {
            return back()->with('error', 'This company has already paid.');
        }

        $franchiseFee = (float) ($company->opportunity?->franchise_fee ?? 0);

        // Always recompute from franchise fee if ezcoin_cost is 0
        $cost = $company->ezcoin_cost > 0
            ? $company->ezcoin_cost
            : self::computeEzCoinCost($franchiseFee);

        // Also save the computed cost back so it's not 0 anymore
        if ($company->ezcoin_cost === 0) {
            $company->update(['ezcoin_cost' => $cost]);
        }

        $userCredit = UserCredit::where('user_id', $user->id)->first();

        if (!$userCredit || $userCredit->balance < $cost) {
            $balance = $userCredit?->balance ?? 0;
            return back()->with('error', "Insufficient EZCoin. Required: {$cost}, Available: {$balance}.");
        }

        try {
            DB::transaction(function () use ($user, $company, $cost) {
                $userCredit = UserCredit::where('user_id', $user->id)->lockForUpdate()->first();
                $userCredit->decrement('balance', $cost);

                CreditTransaction::create([
                    'user_id'     => $user->id,
                    'amount'      => -$cost,
                    'type'        => 'usage',
                    'description' => "Paid registration fee for {$company->company_name} ({$cost} EZCoin)",
                    'metadata'    => json_encode([
                        'company_id'   => $company->id,
                        'company_name' => $company->company_name,
                        'ezcoin_cost'  => $cost,
                    ]),
                ]);

                EzCoinLoadHistory::create([
                    'company_id'    => $company->id,
                    'ezcoin_loaded' => $cost,
                    'bonus_coins'   => 0,
                    'loaded_by'     => $user->email,
                    'admin_id'      => null,
                    'notes'         => 'Company paid registration fee — awaiting admin approval',
                ]);

                $company->update(['payment_status' => 'paid']);
            });

            return back()->with('success', "{$cost} EZCoin paid successfully. Please wait for admin approval.");

        } catch (\Exception $e) {
            Log::error("Payment failed for company {$company->id}: " . $e->getMessage());
            return back()->with('error', 'Payment failed. Please try again.');
        }
    }

    public static function deductOnApproval(Company $company): array
    {
        $companyUser = $company->user;

        if (!$companyUser) {
            return ['success' => false, 'message' => 'No user account linked to this company.'];
        }

        $franchiseFee = (float) ($company->opportunity?->franchise_fee ?? 0);
        $cost = $company->ezcoin_cost > 0
            ? $company->ezcoin_cost
            : self::computeEzCoinCost($franchiseFee);

        $userCredit = UserCredit::where('user_id', $companyUser->id)->first();

        if (!$userCredit || $userCredit->balance < $cost) {
            $balance = $userCredit?->balance ?? 0;
            return [
                'success' => false,
                'message' => "Insufficient EZCoin balance. Required: {$cost} EZCoin, Available: {$balance} EZCoin.",
            ];
        }

        try {
            DB::transaction(function () use ($companyUser, $company, $cost) {
                $userCredit = UserCredit::where('user_id', $companyUser->id)->lockForUpdate()->first();
                $userCredit->decrement('balance', $cost);

                CreditTransaction::create([
                    'user_id'     => $companyUser->id,
                    'amount'      => -$cost,
                    'type'        => 'usage',
                    'description' => "Brand registration approved: {$company->company_name} — {$cost} EZCoin deducted",
                    'metadata'    => json_encode([
                        'company_id'    => $company->id,
                        'company_name'  => $company->company_name,
                        'franchise_fee' => $company->opportunity?->franchise_fee,
                        'ezcoin_cost'   => $cost,
                    ]),
                ]);
            });

            return [
                'success' => true,
                'message' => "{$cost} EZCoin deducted for {$company->company_name}.",
                'cost'    => $cost,
            ];

        } catch (\Exception $e) {
            Log::error("EZCoin deduction failed for company {$company->id}: " . $e->getMessage());
            return ['success' => false, 'message' => 'EZCoin deduction failed. Please try again.'];
        }
    }
}