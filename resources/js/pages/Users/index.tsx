import { useEffect, useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Can } from '@/components/PermissionGate';

interface User {
    id: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string;
    created_at?: string;
}

interface PaginatedData<T> {
    data: T[];
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface PageProps {
    flash?: { message?: string };
    auth: { user: { id: number; role?: string } };
    filters?: { search?: string; role?: string };
    roles?: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' }
];

export default function Users({
    users,
    roles = [],
    filters = {}
}: {
    users: PaginatedData<User>;
    roles?: string[];
    filters?: { search?: string; role?: string };
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
    const debounceRef = useRef<number>();

    const { flash, auth } = usePage().props as unknown as PageProps;

    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
    }, [flash?.message]);

    const openDeleteDialog = (id: number) => {
        setUserToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!userToDeleteId) return;
        router.delete(`/users/${userToDeleteId}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleteDialogOpen(false);
                setUserToDeleteId(null);
            },
            onError: () => toast.error('Failed to delete user. Please try again.'),
        });
    };

    const handleInstantSearch = (value: string, role: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            router.get(
                '/users',
                { search: value || undefined, role: role === 'all' ? undefined : role },
                { preserveState: true, replace: true }
            );
        });
    };

    return (
        <Can permission="view_users" fallback={<div className="p-4">You don't have permission to view users.</div>}>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Management" />
                <div className="flex flex-col gap-4 p-4">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
                                <Input
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleInstantSearch(e.target.value, selectedRole);
                                    }}
                                    placeholder="Search by name or email"
                                    className="w-full sm:w-64"
                                />

                                <Select
                                    value={selectedRole}
                                    onValueChange={(value) => {
                                        setSelectedRole(value);
                                        handleInstantSearch(search, value);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <SelectValue placeholder="Filter by Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role, i) => (
                                            <SelectItem key={i} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <CardAction className="mt-2 sm:mt-0">
                                <Can permission="create_users">
                                    <Link href={'users/create'}>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                                            Add New User
                                        </Button>
                                    </Link>
                                </Can>
                            </CardAction>
                        </CardHeader>

                        <hr />

                        <CardContent className="p-0">
                            <div className="overflow-x-auto hidden sm:block">
                                <Table>
                                    <TableHeader className="bg-gray-100 dark:bg-gray-800">
                                        <TableRow>
                                            <TableHead className="w-[200px]">Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role(s)</TableHead>
                                            <TableHead>Created At</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.length > 0 ? (
                                            users.data.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">{user.first_name ? user.first_name : 'N/A'} {user.last_name ? user.last_name : 'N/A'}</TableCell>
                                                    <TableCell>{user.email ? user.email : ''}</TableCell>
                                                    <TableCell className="flex flex-wrap gap-1">
                                                        {(user.roles ? user.roles : '').split(', ').map((role, index) => (
                                                            <Badge key={index} variant='secondary' className="rounded-full px-3 py-1 text-xs">{role}</Badge>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell>{user.created_at ?? ''}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Can permission="edit_users">
                                                                <Link href={`/users/${user.id}/edit`}>
                                                                    <Button variant='outline' size='sm'>Edit</Button>
                                                                </Link>
                                                            </Can>
                                                            <Can permission="delete_users">
                                                                <Button
                                                                    variant='destructive'
                                                                    size='sm'
                                                                    onClick={() => openDeleteDialog(user.id)}
                                                                    disabled={auth.user.id === user.id}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </Can>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                    No user accounts found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex flex-col gap-4 sm:hidden">
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <div key={user.id} className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold">{user.first_name ? user.first_name : 'N/A'} {user.last_name ? user.last_name : 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{user.email ? user.email : 'N/A'}</div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Can permission="edit_users">
                                                        <Link href={`/users/${user.id}/edit`}>
                                                            <Button variant="outline" size="sm" className="w-full sm:w-auto">Edit</Button>
                                                        </Link>
                                                    </Can>
                                                    <Can permission="delete_users">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => openDeleteDialog(user.id)}
                                                            disabled={auth.user.id === user.id}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Can>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {(user.roles ? user.roles: 'N/A').split(', ').map((role, index) => (
                                                    <Badge key={index} variant='secondary' className="rounded-full px-3 py-1 text-xs">{role}</Badge>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">Created at: {user.created_at ?? ''}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-24 flex items-center justify-center text-gray-500">
                                        No user accounts found.
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        {users.data.length > 0 && (
                            <TablePagination total={users.total} from={users.from} to={users.to} links={users.links} />
                        )}
                    </Card>
                </div>
            </AppLayout>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600">
                            Confirm User Deletion
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-gray-700">
                        Are you sure you want to delete this user (ID: <b>{userToDeleteId}</b>)? This action cannot be undone.
                    </div>
                    <DialogFooter className="flex flex-wrap gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="w-full sm:w-auto"
                        >
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Can>
    );
}
