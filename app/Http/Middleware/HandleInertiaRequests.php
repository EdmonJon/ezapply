<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        // Add versioning to force fresh data for company applicants page
        if ($request->is('company-applicants')) {
            return md5(now()->toISOString());
        }
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        if ($user && !$user->hasRole('company')) {
            $user->loadMissing([
                'basicInfo',
                'financial',
                'affiliations',
                'attachments'
            ]);
        }
        $profileStatus = $user ? $this->checkProfileStatus($user) : ['complete' => false, 'hasAnyData' => false];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'credits' => optional($user->credit)->balance ?? 0,
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'permissions' => $role->permissions->map(function ($permission) {
                                return [
                                    'id' => $permission->id,
                                    'name' => $permission->name,
                                ];
                            }),
                        ];
                    }),
                    'userType' => $user->hasRole('company') ? 'company' : 'customer',
                    'complete' => $profileStatus['complete'],
                    'hasAnyData' => $profileStatus['hasAnyData'],
                    'basicInfo' => $user->basicInfo,
                    'financial' => $user->financial,
                    'affiliations' => $user->affiliations,
                    'attachments' => $user->attachments,
                ] : null,
                'permissions' => $user ? $user->getAllPermissions()->pluck('name') : [],
            ],
            'ads' => \App\Models\Advertisement::where('status', 'active')
        ->get(['id', 'title', 'description', 'file_path', 'file_type', 'placement', 'company_id'])
        ->toArray(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                fn()=> $request->session()->get('message')
                ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
    protected function checkProfileStatus($user): array
{
    if ($user->hasRole('company')) {
        return [
            'complete' => true,
            'hasAnyData' => true,
        ];
    }
     if ($user->hasRole('super_admin')) {
        return [
            'complete' => true,
            'hasAnyData' => true,
        ];
    }
    $user->loadMissing([
        'basicInfo',
        'financial',
        'affiliations',
        'attachments'
    ]);

    // Simple check: if user has basic info and financial data, they can apply
    $hasBasicInfo = $user->basicInfo && !empty($user->basicInfo->first_name);
    $hasFinancial = $user->financial && !empty($user->financial->income_source);

    return [
        'complete' => $hasBasicInfo && $hasFinancial,
        'hasAnyData' => $hasBasicInfo || $hasFinancial,
    ];
}
}
