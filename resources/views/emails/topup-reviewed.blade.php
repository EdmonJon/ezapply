<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
        .header { padding: 32px; text-align: center; background: {{ $topupRequest->status === 'approved' ? '#16a34a' : '#dc2626' }}; }
        .header h1 { color: #fff; margin: 0; font-size: 22px; }
        .header p { color: rgba(255,255,255,.85); margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .amount-box { background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .amount-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .amount-box .value { font-size: 36px; font-weight: 700; color: #111827; margin-top: 4px; }
        .note-box { background: #fef9c3; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 16px; margin-top: 16px; font-size: 13px; color: #92400e; }
        .footer { padding: 20px 32px; background: #f8fafc; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f1f5f9; }
        p { color: #374151; font-size: 14px; line-height: 1.6; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>{{ $topupRequest->status === 'approved' ? '✅ Top-Up Approved!' : '❌ Top-Up Rejected' }}</h1>
        <p>EzApply Credit System</p>
    </div>
    <div class="body">
        <p>Hi <strong>{{ $topupRequest->user->email }}</strong>,</p>

        @if($topupRequest->status === 'approved')
            <p>Great news! Your top-up request has been <strong>approved</strong>. The credits have been added to your wallet.</p>
        @else
            <p>Unfortunately, your top-up request has been <strong>rejected</strong>. Please see the note below and try again.</p>
        @endif

        <div class="amount-box">
            <div class="label">Requested Amount</div>
            <div class="value">{{ number_format($topupRequest->amount) }} Credits</div>
        </div>

        @if($topupRequest->admin_note)
        <div class="note-box">
            <strong>Admin Note:</strong> {{ $topupRequest->admin_note }}
        </div>
        @endif

        <p style="margin-top:20px;">If you have questions, please contact our support team.</p>
    </div>
    <div class="footer">
        EzApply PH · This is an automated message, please do not reply.
    </div>
</div>
</body>
</html>