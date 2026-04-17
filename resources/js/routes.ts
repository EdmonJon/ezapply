// Route helper functions for Inertia.js with ziggy-js fallback
import { route } from 'ziggy-js';

// Helper function to safely get route with fallback
function safeRoute(routeName: string, params: any = null): string {
    try {
        if (params) {
            return route(routeName, params);
        }
        return route(routeName);
    } catch (error) {
        // Fallback to simple URL strings if ziggy fails
        console.warn(`Ziggy route '${routeName}' not found, using fallback URL`);
        return getFallbackUrl(routeName, params);
    }
}

// Fallback URL mapping
function getFallbackUrl(routeName: string, params: any = null): string {
    const fallbackUrls: Record<string, string> = {
        'dashboard': '/dashboard',
        'login': '/login',
        'register': '/register',
        'logout': '/logout',
        'password.request': '/forgot-password',
        'password.reset': '/reset-password',
        'verification.notice': '/verify-email',
        'verification.verify': '/verify-email',
        'verification.send': '/email/verification-notification',
        'password.confirm': '/confirm-password',
        'applicant.basicinfo': '/applicant/basicinfo',
        'applicant.affiliations': '/applicant/affiliations',
        'applicant.financial': '/applicant/financial',
        'applicant.attachments': '/applicant/attachments',
        'applicant.franchise': '/applicant/franchise',
        'applicant.applied_companies': '/applicant/franchise/appliedcompanies',
        'company.register': '/company/register',
        'users.index': '/admin/users',
        'users.create': '/admin/users/create',
        'users.edit': '/admin/users',
        'users.show': '/admin/users',
        'roles.index': '/admin/roles',
        'roles.create': '/admin/roles/create',
        'roles.edit': '/admin/roles',
        'permissions.index': '/admin/permissions',
        'psgc.regions': '/psgc/regions',
        'psgc.provinces': '/psgc/regions',
        'psgc.cities': '/psgc/provinces',
        'psgc.barangays': '/psgc/cities-municipalities',
        'home': '/',
        'settings.appearance': '/settings/appearance',
    };

    let url = fallbackUrls[routeName] || '/';
    
    // Handle parameterized routes
    if (params) {
        if (routeName === 'password.reset' && params.token) {
            url = `/reset-password/${params.token}`;
        } else if (routeName === 'verification.verify' && params.id && params.hash) {
            url = `/verify-email/${params.id}/${params.hash}`;
        } else if (routeName === 'psgc.provinces' && params.region) {
            url = `/psgc/regions/${params.region}/provinces`;
        } else if (routeName === 'psgc.cities' && params.province) {
            url = `/psgc/provinces/${params.province}/cities-municipalities`;
        } else if (routeName === 'psgc.barangays' && params.city) {
            url = `/psgc/cities-municipalities/${params.city}/barangays`;
        } else if (routeName === 'users.edit' && params.user) {
            url = `/admin/users/${params.user}/edit`;
        } else if (routeName === 'users.show' && params.user) {
            url = `/admin/users/${params.user}`;
        } else if (routeName === 'roles.edit' && params.role) {
            url = `/admin/roles/${params.role}/edit`;
        }
    }
    
    return url;
}

// Dashboard route
export function dashboard() {
    return safeRoute('dashboard');
}

// Authentication routes
export function login() {
    return safeRoute('login');
}

export function register() {
    return safeRoute('register');
}

export function logout() {
    return safeRoute('logout');
}

// Password reset routes
export function passwordRequest() {
    return safeRoute('password.request');
}

export function passwordReset(token: string) {
    return safeRoute('password.reset', { token });
}

// Email verification routes
export function verificationNotice() {
    return safeRoute('verification.notice');
}

export function verificationVerify(id: string, hash: string) {
    return safeRoute('verification.verify', { id, hash });
}

export function verificationSend() {
    return safeRoute('verification.send');
}

// Password confirmation
export function passwordConfirm() {
    return safeRoute('password.confirm');
}

// Applicant routes
export function applicantBasicInfo() {
    return safeRoute('applicant.basicinfo');
}

export function applicantAffiliations() {
    return safeRoute('applicant.affiliations');
}

export function applicantFinancial() {
    return safeRoute('applicant.financial');
}

export function applicantAttachments() {
    return safeRoute('applicant.attachments');
}

export function applicantFranchise() {
    return safeRoute('applicant.franchise');
}

export function applicantAppliedCompanies() {
    return safeRoute('applicant.applied_companies');
}

// Company routes
export function companyRegister() {
    return safeRoute('company.register');
}

// User management routes
export function users() {
    return safeRoute('users.index');
}

export function userCreate() {
    return safeRoute('users.create');
}

export function userEdit(id: number) {
    return safeRoute('users.edit', { user: id });
}

export function userShow(id: number) {
    return safeRoute('users.show', { user: id });
}

// Role management routes
export function roles() {
    return safeRoute('roles.index');
}

export function roleCreate() {
    return safeRoute('roles.create');
}

export function roleEdit(id: number) {
    return safeRoute('roles.edit', { role: id });
}

// Permission management routes
export function permissions() {
    return safeRoute('permissions.index');
}

// PSGC (Philippine Standard Geographic Code) routes
export function psgcRegions() {
    return safeRoute('psgc.regions');
}

export function psgcProvinces(regionCode: string) {
    return safeRoute('psgc.provinces', { region: regionCode });
}

export function psgcCities(provinceCode: string) {
    return safeRoute('psgc.cities', { province: provinceCode });
}

export function psgcBarangays(cityCode: string) {
    return safeRoute('psgc.barangays', { city: cityCode });
}

// Home route
export function home() {
    return safeRoute('home');
}

// Settings routes
export function appearance() {
    return safeRoute('settings.appearance');
}
