// src/types/index.ts

import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

// Assuming you have a User interface defined elsewhere, if not, add it
export interface User {
    id: number;
    name: string;
    email: string;
    first_name: string;
    last_name: string;
    credits: number;
    roles: {
        id: number;
        name: string;
        permissions: {
            id: number;
            name: string;
        }[];
    }[];
    userType: 'company' | 'customer';
    complete: boolean;
    hasAnyData: boolean;
    basicInfo: unknown;
    financial: unknown;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    credits: number;
    roles: string[];
    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission: string
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    balance?: number;
    credit_transactions?: Transactions[]; 
    [key: string]: unknown;
}

export interface Transactions {
    id: number;
    user_id: number;
    amount: number;
    type: 'topup' | 'usage' | string; 
    description: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        email?: string;
        first_name?: string;
        last_name?: string;
        company?: { company_name?: string } | null;
        [key: string]: unknown;
    } | null;
    [key: string]: unknown;
}