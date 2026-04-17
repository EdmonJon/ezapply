import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {toast} from 'sonner';
import { Permission, Role, SinglePermission, SingleRole} from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Can } from '@/components/PermissionGate';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Roles', 
      href: '/roles' 
    }
];



export default function Roles({ roles} : {roles : Role}) {


const {flash} = usePage<{flash: {message?: string}}>().props; 

useEffect(() => {
    if(flash.message){
        
        toast.success(flash.message);
    }
}, [flash.message])

function deleteRoles(id: number){
    if(confirm('Are you sure you want to delete this role?')){
        router.delete(`/roles/${id}`); 
    }
}

  const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <Can permission="view_roles" fallback={<div className="p-4">You don't have permission to view roles.</div>}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className='flex justify-between items-center'>
                        <CardTitle>Roles Management</CardTitle>
                        <CardAction>
                            <Can permission="create_roles">
                            <Link href={'roles/create'}>
                                <Button>Add new</Button>
                            </Link>
                            </Can>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <Table>
                            <TableHeader className='bg-gray-100 '>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Permission</TableHead>
                                    <TableHead>Created at</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.data.map((role, index) => (
                                    <TableRow>
                                        <TableCell>{index+1}</TableCell>
                                        <TableCell>{role.name}</TableCell>
                                        <TableCell className='flex flex-wrap gap-1'>{role.permissions.map((perm, index) => (
                                            <Badge variant={'outline'} key={index}>
                                                {perm}
                                            </Badge>
                                        ))}</TableCell>
                                        <TableCell>{role.created_at}</TableCell>
                                        <TableCell>
                                            <Can permission="edit_roles">
                                            <Link href={`/roles/${role.id}/edit`}>
                                            
                                                <Button variant={'outline'}>Edit</Button>
                                            </Link>
                                            </Can>
                                                <Can permission="delete_roles">
                                            <Button variant={'destructive'} className='ml-2' onClick={()=> deleteRoles(role.id)}>Delete</Button>
                                                </Can>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>

                </Card>
 

            </div>
        </AppLayout>
        </Can>
    );
}