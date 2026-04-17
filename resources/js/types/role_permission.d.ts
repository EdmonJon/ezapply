interface SinglePermission {
    id: number;
    name: string;
    created_at: string;
}

interface SingleRole {
    id: number;
    name: string;
    permissions: string[]; // matches controller
    created_at: string;
}

export interface Permission extends Pagination {
    links: Links[];
    to: number;
    from: number;
    total: number;
    data: SinglePermission[];
}

export interface RolePermission{
    id: number;
    name: string;
    permissions: SinglePermission [];
    created_at: string;
}

export interface Role extends Pagination {
    links: Links[];
    to: number;
    from: number;
    total: number;
    data: SingleRole[];
}
