<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .body { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Franchise Application Received</h2>
        </div>
        <div class="body">
            <p>Hello, you have received a new franchise application for <strong>{{ $application->company->company_name }}</strong>.</p>

            <div class="detail">
                <span class="label">Applicant Name:</span>
                {{ optional($application->user->basicInfo)->first_name }}
                {{ optional($application->user->basicInfo)->last_name }}
            </div>
            <div class="detail">
                <span class="label">Applicant Email:</span>
                {{ $application->user->email }}
            </div>
            <div class="detail">
                <span class="label">Applied On:</span>
                {{ $application->created_at->format('F d, Y h:i A') }}
            </div>
            <div class="detail">
                <span class="label">Status:</span>
                {{ ucfirst($application->status) }}
            </div>

            <p style="margin-top: 20px;">Please log in to your dashboard to review this application.</p>
        </div>
    </div>
</body>
</html>
