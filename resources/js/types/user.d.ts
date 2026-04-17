export interface SingleUser {
    id: number;
    first_name?: string;    
    last_name?: string;     
    phone_number?: string;
    address?: string;
    email?: string;
    roles?: string;         
    created_at?: string;
}

export interface User extends Pagination {
    links: Links[];
    to: number;
    from: number;
    total: number;
    data: SingleUser[];
}

export interface UserRole extends SingleUser {
    basicInfo: any;
    basic_info: any;
    roles?: SingleRole[];   
}
export interface SingleRole {
    id: number;
    name: string;
    guard_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Links {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
}

export interface PageProps {
    flash: { message?: string };
    auth: { user?: { id?: number; role?: string } };
    filters: { search?: string; role?: string };
    roles: string[];
}