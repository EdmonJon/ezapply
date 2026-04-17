<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #16a34a; padding: 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .body { padding: 30px; color: #333; }
        .body h2 { color: #16a34a; }
        .details { background: #f9f9f9; border-radius: 6px; padding: 16px; margin: 20px 0; }
        .details p { margin: 6px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; }
        .btn { display: inline-block; background: #16a34a; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
        </div>
        <div class="body">
            <h2>Your company has been approved!</h2>
            <p>Hi {{ $company->agent_name }},</p>
            <p>We're happy to inform you that your company registration has been <strong>approved</strong> and is now live on EZApply.</p>

            <div class="details">
                <p><strong>Company Name:</strong> {{ $company->company_name }}</p>
                @if($company->brand_name)
                <p><strong>Brand Name:</strong> {{ $company->brand_name }}</p>
                @endif
                <p><strong>Status:</strong> Approved ✅</p>
            </div>

            <p>Applicants can now find and apply to your franchise listing. Make sure your profile is complete to attract the best candidates.</p>

            <a href="{{ url('/my-companies') }}" class="btn">View My Company</a>
        </div>
        <div class="footer">
            <p>This is an automated email from EZApply. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>