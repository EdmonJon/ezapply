<?php

namespace App\Observers;

use App\Mail\ApplicationReceived;
use App\Models\Application;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ApplicationObserver
{
    public function created(Application $application): void
    {
        try {
            // Load relationships needed for the email
            $application->load(['company.user', 'user.basicInfo']);

            $companyOwner = optional($application->company)->user;

            if ($companyOwner && $companyOwner->email) {
                Mail::to($companyOwner->email)->send(new ApplicationReceived($application));
                Log::info('Application notification email sent to: ' . $companyOwner->email);
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send application email: ' . $e->getMessage());
        }
    }
}