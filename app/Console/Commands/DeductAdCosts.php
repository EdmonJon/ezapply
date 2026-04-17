<?php

namespace App\Console\Commands;

use App\Models\Advertisement;
use App\Models\Credit;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DeductAdCosts extends Command
{
    protected $signature   = 'ads:deduct-daily';
    protected $description = 'Deduct daily EZCoin cost from active advertisements';

    public function handle()
    {
        $today = now()->toDateString();

        $activeAds = Advertisement::where('status', 'active')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date',   '>=', $today)
            ->get();

        foreach ($activeAds as $ad) {
            $credit = Credit::where('user_id', $ad->user_id)->first();

            if (!$credit || $credit->balance < $ad->daily_cost) {
                $ad->update(['status' => 'stopped']);
                Log::info("Ad #{$ad->id} stopped — insufficient balance.");
                continue;
            }

            $credit->decrement('balance', $ad->daily_cost);
            $ad->update(['last_deducted_at' => now()]);
            Log::info("Ad #{$ad->id} deducted {$ad->daily_cost} EZCoins.");
        }

        // Mark expired ads
        Advertisement::where('status', 'active')
            ->whereDate('end_date', '<', $today)
            ->update(['status' => 'expired']);

        $this->info('Daily ad deduction complete.');
    }
}