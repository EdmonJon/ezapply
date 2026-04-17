<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Company;
use App\Models\Application;
use App\Models\CreditTransaction;
use App\Models\ApplicantView;
use App\Models\Financial;
use App\Models\TopupRequest;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        // ── KPI Cards ──────────────────────────────────────────────
        $totalUsers        = User::count();
        $totalCompanies    = Company::count();
        $totalApplications = Application::count();
        $pendingApprovals  = Company::where('status', 'pending')->count();
        $creditsIssued     = CreditTransaction::where('type', 'top_up')->sum('amount');
        $creditsUsed       = CreditTransaction::where('type', 'purchase_info')->sum(DB::raw('ABS(amount)'));

        // ── Registration Stats ─────────────────────────────────────
        $registrations = [
            'users' => [
                'today'      => User::whereDate('created_at', today())->count(),
                'this_week'  => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => User::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            ],
            'companies' => [
                'today'      => Company::whereDate('created_at', today())->count(),
                'this_week'  => Company::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => Company::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            ],
            'applications' => [
                'today'      => Application::whereDate('created_at', today())->count(),
                'this_week'  => Application::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => Application::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            ],
        ];

        $dailyRegistrations = collect(range(13, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            return [
                'date'         => $date->format('M d'),
                'users'        => User::whereDate('created_at', $date)->count(),
                'companies'    => Company::whereDate('created_at', $date)->count(),
                'applications' => Application::whereDate('created_at', $date)->count(),
            ];
        })->values();

        $weeklyRegistrations = collect(range(7, 0))->map(function ($weeksAgo) {
            $start = now()->subWeeks($weeksAgo)->startOfWeek();
            $end   = now()->subWeeks($weeksAgo)->endOfWeek();
            return [
                'week'         => 'W' . $start->weekOfYear,
                'users'        => User::whereBetween('created_at', [$start, $end])->count(),
                'companies'    => Company::whereBetween('created_at', [$start, $end])->count(),
                'applications' => Application::whereBetween('created_at', [$start, $end])->count(),
            ];
        })->values();

        $monthlyRegistrations = collect(range(11, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            return [
                'month'        => $date->format('M Y'),
                'users'        => User::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
                'companies'    => Company::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
                'applications' => Application::whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->count(),
            ];
        })->values();

        // ── Application Details ────────────────────────────────────
        $appsByMonth = Application::selectRaw("
                DATE_FORMAT(created_at, '%b') as month,
                MONTH(created_at) as month_num,
                YEAR(created_at) as year,
                COUNT(*) as applications,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvals,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejections,
                SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) as pending
            ")
            ->where('created_at', '>=', now()->subMonths(8))
            ->groupBy('month', 'month_num', 'year')
            ->orderByRaw('year ASC, month_num ASC')
            ->get();

        $appStatusBreakdown = [
            ['name' => 'Pending',  'value' => Application::where('status', 'pending')->count(),  'color' => '#d97706'],
            ['name' => 'Approved', 'value' => Application::where('status', 'approved')->count(), 'color' => '#16a34a'],
            ['name' => 'Rejected', 'value' => Application::where('status', 'rejected')->count(), 'color' => '#dc2626'],
        ];

        $totalViewed  = ApplicantView::distinct('application_id')->count('application_id');
        $approvedApps = Application::where('status', 'approved')->count();
        $appFunnel = [
            ['stage' => 'Submitted', 'count' => $totalApplications],
            ['stage' => 'Viewed',    'count' => $totalViewed],
            ['stage' => 'Approved',  'count' => $approvedApps],
        ];

        $appsByLocation = Application::selectRaw('desired_location, COUNT(*) as count')
            ->whereNotNull('desired_location')
            ->where('desired_location', '!=', '')
            ->groupBy('desired_location')
            ->orderByDesc('count')
            ->limit(8)
            ->get()
            ->map(fn($r) => ['location' => $r->desired_location, 'count' => (int) $r->count]);

        $avgAppsPerCompany = $totalCompanies > 0 ? round($totalApplications / $totalCompanies, 1) : 0;

        // ── Sales Details ──────────────────────────────────────────
        $totalRevenue = TopupRequest::where('status', 'approved')->sum('amount');

        $salesKpis = [
            'total_revenue'      => (int) $totalRevenue,
            'credits_issued'     => (int) $creditsIssued,
            'credits_used'       => (int) $creditsUsed,
            'pending_topups'     => TopupRequest::where('status', 'pending')->count(),
            'approved_topups'    => TopupRequest::where('status', 'approved')->count(),
            'avg_topup_amount'   => (int) TopupRequest::where('status', 'approved')->avg('amount'),
            'total_purchases'    => CreditTransaction::where('type', 'purchase_info')->count(),
            'revenue_this_month' => (int) TopupRequest::where('status', 'approved')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount'),
        ];

        $monthlySales = collect(range(11, 0))->map(function ($monthsAgo) {
            $date   = now()->subMonths($monthsAgo);
            $topUp  = CreditTransaction::where('type', 'top_up')->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->sum('amount');
            $usage  = CreditTransaction::where('type', 'purchase_info')->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->sum(DB::raw('ABS(amount)'));
            $refund = CreditTransaction::where('type', 'refund')->whereMonth('created_at', $date->month)->whereYear('created_at', $date->year)->sum('amount');
            return [
                'month'   => $date->format('M Y'),
                'topUp'   => (int) $topUp,
                'usage'   => (int) $usage,
                'refunds' => (int) $refund,
                'net'     => (int) ($topUp - $refund),
            ];
        })->values();

        $creditsByMonth = CreditTransaction::selectRaw("
                DATE_FORMAT(created_at, '%b') as month,
                MONTH(created_at) as month_num,
                YEAR(created_at) as year,
                SUM(CASE WHEN type = 'top_up' THEN amount ELSE 0 END) as topUp,
                SUM(CASE WHEN type = 'purchase_info' THEN ABS(amount) ELSE 0 END) as `usage`,
                SUM(CASE WHEN type = 'refund' THEN amount ELSE 0 END) as refunds
            ")
            ->where('created_at', '>=', now()->subMonths(8))
            ->groupBy('month', 'month_num', 'year')
            ->orderByRaw('year ASC, month_num ASC')
            ->get();

        $creditTypeBreakdown = CreditTransaction::selectRaw('type, COUNT(*) as count, SUM(ABS(amount)) as total')
            ->groupBy('type')
            ->get()
            ->map(fn($r) => [
                'type'  => ucfirst(str_replace('_', ' ', $r->type)),
                'count' => (int) $r->count,
                'total' => (int) $r->total,
                'color' => match($r->type) {
                    'top_up'        => '#6366f1',
                    'purchase_info' => '#16a34a',
                    'refund'        => '#d97706',
                    'signup_bonus'  => '#8b5cf6',
                    default         => '#6b7280',
                },
            ]);

        $topSpenders = DB::table('credit_transactions')
            ->join('users', 'credit_transactions.user_id', '=', 'users.id')
            ->where('credit_transactions.type', 'purchase_info')
            ->selectRaw('users.email, SUM(ABS(credit_transactions.amount)) as spent, COUNT(*) as txns')
            ->groupBy('users.id', 'users.email')
            ->orderByDesc('spent')
            ->limit(5)
            ->get();

        // ── Company Status Breakdown ───────────────────────────────
        $companyStatus = Company::selectRaw("status, COUNT(*) as value")
            ->groupBy('status')
            ->get()
            ->map(fn($r) => [
                'name'  => ucfirst($r->status),
                'value' => (int) $r->value,
                'color' => match($r->status) {
                    'approved' => '#16a34a',
                    'pending'  => '#d97706',
                    'rejected' => '#dc2626',
                    default    => '#6b7280',
                }
            ]);

        // ── User Role Breakdown ────────────────────────────────────
        $userRoles = DB::table('users')
            ->join('model_has_roles', 'users.id', '=', 'model_has_roles.model_id')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->selectRaw('roles.name as name, COUNT(*) as value')
            ->groupBy('roles.name')
            ->get()
            ->map(fn($r) => [
                'name'  => ucfirst($r->name),
                'value' => (int) $r->value,
                'color' => match($r->name) {
                    'customer'    => '#6366f1',
                    'company'     => '#16a34a',
                    'admin'       => '#d97706',
                    'super_admin' => '#ef4444',
                    'agent'       => '#8b5cf6',
                    default       => '#6b7280',
                }
            ]);

        // ── Top Companies by Applications ──────────────────────────
        $topCompanies = Company::withCount('applications')
            ->orderByDesc('applications_count')
            ->limit(6)
            ->get()
            ->map(fn($c) => [
                'name'   => $c->company_name,
                'apps'   => $c->applications_count,
                'views'  => ApplicantView::whereHas('application', fn($q) => $q->where('company_id', $c->id))->count(),
                'status' => $c->status,
            ]);

        // ── Applicant Income Brackets ──────────────────────────────
        $incomes = Financial::selectRaw("
                CASE
                    WHEN monthly_income < 20000  THEN '< ₱20k'
                    WHEN monthly_income < 40000  THEN '₱20-40k'
                    WHEN monthly_income < 80000  THEN '₱40-80k'
                    WHEN monthly_income < 150000 THEN '₱80-150k'
                    ELSE '> ₱150k'
                END as `range`, COUNT(*) as count
            ")
            ->whereNotNull('monthly_income')
            ->groupByRaw("CASE WHEN monthly_income < 20000 THEN '< ₱20k' WHEN monthly_income < 40000 THEN '₱20-40k' WHEN monthly_income < 80000 THEN '₱40-80k' WHEN monthly_income < 150000 THEN '₱80-150k' ELSE '> ₱150k' END")
            ->get();

        // ── Regional Distribution ──────────────────────────────────
        $regions = DB::table('users')
            ->join('users_address', 'users.id', '=', 'users_address.user_id')
            ->selectRaw('users_address.region_name as region, COUNT(*) as u')
            ->whereNotNull('users_address.region_name')
            ->groupBy('users_address.region_name')
            ->orderByDesc('u')
            ->limit(7)
            ->get();

        // ── Recent Activity Feed ───────────────────────────────────
        $recentApps = Application::with(['user.basicInfo', 'company'])
            ->latest()->limit(3)->get()
            ->map(fn($a) => [
                'time'  => $a->created_at->diffForHumans(),
                'event' => 'Application submitted',
                'name'  => ($a->user?->basicInfo?->first_name ?? $a->user?->email ?? 'Unknown') . ' → ' . ($a->company?->company_name ?? ''),
                't'     => $a->status === 'approved' ? 'ok' : ($a->status === 'rejected' ? 'no' : 'app'),
            ]);

        $recentCompanies = Company::latest()->limit(2)->get()
            ->map(fn($c) => [
                'time'  => $c->created_at->diffForHumans(),
                'event' => 'Company registered',
                'name'  => $c->company_name,
                't'     => 'co',
            ]);

        $recentCredits = CreditTransaction::where('type', 'top_up')->latest()->limit(2)->get()
            ->map(fn($t) => [
                'time'  => $t->created_at->diffForHumans(),
                'event' => 'Credits added',
                'name'  => $t->description ?? "Top-up: {$t->amount} credits",
                't'     => 'cr',
            ]);

        $feed = collect([...$recentApps, ...$recentCompanies, ...$recentCredits])->values()->take(6);

        return Inertia::render('Admin/Analytics', [
            'kpis'                => ['totalUsers' => $totalUsers, 'totalCompanies' => $totalCompanies, 'totalApplications' => $totalApplications, 'pendingApprovals' => $pendingApprovals, 'creditsIssued' => $creditsIssued, 'creditsUsed' => $creditsUsed],
            'registrations'       => $registrations,
            'dailyRegistrations'  => $dailyRegistrations,
            'weeklyRegistrations' => $weeklyRegistrations,
            'monthlyRegistrations'=> $monthlyRegistrations,
            'appsByMonth'         => $appsByMonth,
            'appStatusBreakdown'  => $appStatusBreakdown,
            'appFunnel'           => $appFunnel,
            'appsByLocation'      => $appsByLocation,
            'avgAppsPerCompany'   => $avgAppsPerCompany,
            'companyStatus'       => $companyStatus,
            'userRoles'           => $userRoles,
            'salesKpis'           => $salesKpis,
            'monthlySales'        => $monthlySales,
            'creditsByMonth'      => $creditsByMonth,
            'creditTypeBreakdown' => $creditTypeBreakdown,
            'topSpenders'         => $topSpenders,
            'topCompanies'        => $topCompanies,
            'appStatus'           => [],
            'incomes'             => $incomes,
            'regions'             => $regions,
            'feed'                => $feed,
        ]);
    }
}