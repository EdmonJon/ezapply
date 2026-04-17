<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TopupRequest;
use App\Models\UserCredit;
use App\Models\CreditTransaction;
use App\Mail\TopupRequestReviewed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TopupRequestController extends Controller
{
    // User submits a top-up request with proof of payment
    public function store(Request $request)
    {
        $request->validate([
            'amount'           => 'required|integer|min:1',
            'proof_of_payment' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('proof_of_payment')->store('topup-proofs', 'public');

        TopupRequest::create([
            'user_id'          => auth()->id(),
            'amount'           => $request->amount,
            'proof_of_payment' => $path,
            'status'           => 'pending',
        ]);

        return redirect()->back()->with('success', 'Top-up request submitted! Waiting for admin approval.');
    }

    // Admin views all pending requests
    public function index()
    {
        $requests = TopupRequest::with('user')
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => [
                'id'               => $r->id,
                'user_email'       => $r->user->email,
                'amount'           => $r->amount,
                'proof_url' => asset('storage/' . $r->proof_of_payment),
                'status'           => $r->status,
                'admin_note'       => $r->admin_note,
                'created_at'       => $r->created_at->diffForHumans(),
                'reviewed_at'      => $r->reviewed_at?->diffForHumans(),
            ]);

        return Inertia::render('Admin/TopupRequests', [
            'requests' => $requests,
        ]);
    }

    // Admin approves or rejects
    public function review(Request $request, TopupRequest $topupRequest)
    {
        $request->validate([
            'action'     => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:500',
        ]);

        if ($topupRequest->status !== 'pending') {
            return redirect()->back()->with('error', 'This request has already been reviewed.');
        }

        DB::transaction(function () use ($request, $topupRequest) {
            $topupRequest->update([
                'status'      => $request->action,
                'admin_note'  => $request->admin_note,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            if ($request->action === 'approved') {
                $userCredit = UserCredit::firstOrCreate(
                    ['user_id' => $topupRequest->user_id],
                    ['balance' => 0]
                );
                $userCredit->increment('balance', $topupRequest->amount);

                CreditTransaction::create([
                    'user_id'     => $topupRequest->user_id,
                    'amount'      => $topupRequest->amount,
                    'type'        => 'top_up',
                    'description' => "Top-up approved: {$topupRequest->amount} credits added",
                    'metadata'    => json_encode([
                        'topup_request_id' => $topupRequest->id,
                        'reviewed_by'      => auth()->id(),
                    ]),
                ]);
            }
        });

        // Send email notification
        try {
            $topupRequest->load('user');
            Mail::to($topupRequest->user->email)->send(new TopupRequestReviewed($topupRequest));
        } catch (\Exception $e) {
            Log::error('Failed to send topup review email: ' . $e->getMessage());
        }

        $msg = $request->action === 'approved' ? 'Request approved and credits added!' : 'Request rejected.';
        return redirect()->back()->with('success', $msg);
    }
}