<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    // store applications for the authenticated user
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id' => 'sometimes|integer|exists:companies,id',
            'companyIds' => 'sometimes|array|min:1',
            'companyIds.*' => 'integer|exists:companies,id',
            'desired_location' => 'nullable|string|max:255',
            'deadline_date' => 'nullable|date',
        ]);

        $userId = auth()->id();

        $companyIds = [];
        if (isset($data['company_id'])) {
            $companyIds = [$data['company_id']];
        } elseif (isset($data['companyIds'])) {
            $companyIds = $data['companyIds'];
        }

        foreach ($companyIds as $companyId) {
            Application::firstOrCreate(
                [
                    'user_id' => $userId,
                    'company_id' => $companyId,
                ],
                [
                    'desired_location' => $data['desired_location'] ?? null,
                    'deadline_date' => $data['deadline_date'] ?? null,
                    'status' => 'pending',
                ]
            );
        }

        return back();
    }

    // list logged-in user's applications
    public function index()
    {
        $userId = auth()->id();
        $applications = Application::with([
            'company.user',
            'company.opportunity',
            'company.background',
            'company.requirements',
            'company.marketing'
        ])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        return Inertia::render('Applicant/AppliedCompanies', [
            'applications' => $applications,
        ]);
    }

    // get applied company IDs for the authenticated user
    public function getAppliedCompanyIds()
    {
        $userId = auth()->id();
        $appliedCompanyIds = Application::where('user_id', $userId)
            ->pluck('company_id')
            ->toArray();

        return response()->json($appliedCompanyIds);
    }
    public function destroy($companyId)
{
    $userId = auth()->id();

    $application = Application::where('user_id', $userId)
        ->where('company_id', $companyId)
        ->first();

    if (!$application) {
        return response()->json(['error' => 'Application not found'], 404);
    }

    $application->delete();

    return response()->json(['message' => 'Application cancelled successfully']);
}
}
