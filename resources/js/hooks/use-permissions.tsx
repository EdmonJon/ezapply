import { usePage } from '@inertiajs/react';

// The backend user shape may vary. Support multiple representations safely.
type PermissionLike = { id?: number; name?: string } | string;
type RoleLike = { id?: number; name?: string; permissions?: PermissionLike[] } | string;

interface AnyUserShape {
    id: number;
    name?: string;
    email?: string;
    // roles can be: string (comma-separated), string[], or Role objects
    roles?: RoleLike[] | string;
    // permissions can also be sent flat
    permissions?: PermissionLike[];
    // sometimes a single role field is used
    role?: string | RoleLike;
    [key: string]: unknown;
}

interface PageProps {
    auth: {
        user: AnyUserShape;
    };
}

function toStringArray(input?: string | string[]): string[] {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String).filter(Boolean);
    return String(input)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
}

function normalizeRoles(user?: AnyUserShape): Set<string> {
    const roleNames = new Set<string>();
    if (!user) return roleNames;

    // role
    const singleRole = user.role as RoleLike | undefined;
    if (singleRole) {
        if (typeof singleRole === 'string') roleNames.add(singleRole);
        else if (singleRole.name) roleNames.add(singleRole.name);
    }

    // roles: string (comma-separated)
    if (typeof user.roles === 'string') {
        toStringArray(user.roles).forEach(r => roleNames.add(r));
    }

    // roles: array of strings or objects
    if (Array.isArray(user.roles)) {
        for (const r of user.roles) {
            if (typeof r === 'string') roleNames.add(r);
            else if (r && typeof r === 'object' && r.name) roleNames.add(r.name);
        }
    }

    return roleNames;
}

function normalizePermissions(user?: AnyUserShape): Set<string> {
    const permissionNames = new Set<string>();
    if (!user) return permissionNames;

    // flat permissions array
    if (Array.isArray(user.permissions)) {
        for (const p of user.permissions) {
            if (typeof p === 'string') permissionNames.add(p);
            else if (p?.name) permissionNames.add(p.name);
        }
    }

    // permissions nested under roles
    if (Array.isArray(user.roles)) {
        for (const r of user.roles) {
            if (r && typeof r === 'object' && Array.isArray(r.permissions)) {
                for (const p of r.permissions) {
                    if (typeof p === 'string') permissionNames.add(p);
                    else if (p?.name) permissionNames.add(p.name);
                }
            }
        }
    }

    return permissionNames;
}

export function usePermissions() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user as AnyUserShape | undefined;

    const roleNames = normalizeRoles(user);
    const permissionNames = normalizePermissions(user);

    const hasPermission = (permission: string): boolean => {
        if (!permission) return false;
        return permissionNames.has(permission);
    };

    const hasRole = (roleName: string): boolean => {
        if (!roleName) return false;
        return roleNames.has(roleName);
    };

    const hasAnyRole = (roleNamesToCheck: string[]): boolean => {
        if (!roleNamesToCheck || roleNamesToCheck.length === 0) return false;
        return roleNamesToCheck.some(r => roleNames.has(r));
    };

    const hasAllRoles = (roleNamesToCheck: string[]): boolean => {
        if (!roleNamesToCheck || roleNamesToCheck.length === 0) return false;
        return roleNamesToCheck.every(r => roleNames.has(r));
    };

    const can = (permission: string): boolean => hasPermission(permission);
    const isAdmin = (): boolean => hasRole('super_admin') || hasRole('admin');
    const isCompany = (): boolean => hasRole('company');
    const isCustomer = (): boolean => hasRole('customer') || hasRole('applicant');

    return {
        hasPermission,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        can,
        isAdmin,
        isCompany,
        isCustomer,
        user,
    };
}