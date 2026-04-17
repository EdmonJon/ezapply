<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Company;
use App\Models\Application;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Get user-specific statistics based on their role
        $stats = $this->getUserStats($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }

    private function getUserStats(User $user)
    {
        $userRole = $user->roles()->first()?->name ?? 'customer';

        switch ($userRole) {
            case 'company':
                return $this->getCompanyUserStats($user);
            case 'customer':
                return $this->getCustomerUserStats($user);
            case 'admin':
                return $this->getAdminStats();
            default:
                return $this->getDefaultStats($user);
        }
    }

    private function getCompanyUserStats(User $user)
    {
        // For company users, show their own companies and applications to their companies
        $totalCompanies = $user->companies()->count();
        $totalApplications = Application::whereHas('company', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();
        $pendingApplications = Application::whereHas('company', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->where('status', 'pending')->count();
        $approvedCompanies = $user->companies()->where('status', 'approved')->count();

        return [
            'totalCompanies' => $totalCompanies,
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedCompanies' => $approvedCompanies,
            'userRole' => 'company'
        ];
    }

    private function getCustomerUserStats(User $user)
    {
        // For customer users, show their applications and related stats
        $totalApplications = $user->applications()->count();
        $pendingApplications = $user->applications()->where('status', 'pending')->count();
        $approvedApplications = $user->applications()->where('status', 'approved')->count();
        $rejectedApplications = $user->applications()->where('status', 'rejected')->count();

        return [
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedApplications' => $approvedApplications,
            'rejectedApplications' => $rejectedApplications,
            'userRole' => 'customer'
        ];
    }

    private function getAdminStats()
    {
        // For admin users, show global statistics
        $totalCompanies = Company::count();
        $totalApplications = Application::count();
        $totalUsers = User::count();
        $pendingApprovals = Company::where('status', 'pending')->count();

        return [
            'totalCompanies' => $totalCompanies,
            'totalApplications' => $totalApplications,
            'totalUsers' => $totalUsers,
            'pendingApprovals' => $pendingApprovals,
            'userRole' => 'admin'
        ];
    }

    private function getDefaultStats(User $user)
    {
        // Default stats for users without specific roles (treat as customer)
        $totalApplications = $user->applications()->count();
        $pendingApplications = $user->applications()->where('status', 'pending')->count();
        $approvedApplications = $user->applications()->where('status', 'approved')->count();
        $totalCompanies = Company::where('status', 'approved')->count(); // Available companies for application

        return [
            'totalApplications' => $totalApplications,
            'pendingApplications' => $pendingApplications,
            'approvedApplications' => $approvedApplications,
            'totalCompanies' => $totalCompanies,
            'userRole' => 'customer'
        ];
    }
}
