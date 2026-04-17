import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGateProps {
    permission?: string;
    role?: string;
    roles?: string[];
    requireAll?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export default function PermissionGate({
    permission,
    role,
    roles,
    requireAll = false,
    fallback = null,
    children,
}: PermissionGateProps) {
    const { hasPermission, hasRole, hasAnyRole, hasAllRoles } = usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (role) {
        hasAccess = hasRole(role);
    } else if (roles && roles.length > 0) {
        hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
    } else {
        // If no permission/role specified, show by default
        hasAccess = true;
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGate role="super_admin" fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

export function CompanyOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGate role="company" fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

export function CustomerOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGate role="customer" fallback={fallback}>
            {children}
        </PermissionGate>
    );
}

export function Can({ permission, children, fallback = null }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) {
    return (
        <PermissionGate permission={permission} fallback={fallback}>
            {children}
        </PermissionGate>
    );
}
