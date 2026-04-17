<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\TopupRequest;

class TopupRequestReviewed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public TopupRequest $topupRequest) {}

    public function envelope(): Envelope
    {
        $subject = $this->topupRequest->status === 'approved'
            ? '✅ Your Top-Up Request has been Approved'
            : '❌ Your Top-Up Request has been Rejected';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.topup-reviewed');
    }
}