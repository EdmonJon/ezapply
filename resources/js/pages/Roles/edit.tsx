import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { Permission, Role, RolePermission, SinglePermission } from '@/types/role_permission';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';



const breadcrumbs: BreadcrumbItem[] = [
    { 
      title: 'Edit Roles', 
      href: '/roles' 
    }
];



export default function EditRoles({ permissions, role }: { permissions: string[], role: RolePermission}) {
  const permissionList = role.permissions.map((perm) => perm.name);
  console.log(permissionList);

  const {data, setData, put, errors, reset, processing} = useForm({
    name: role.name,
    permissions: permissionList,
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    put(`/roles/${role.id}`)
  }

  const { auth } = usePage().props as any;
  const roles = auth.user.role;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className='flex justify-between items-center'>
                        <CardTitle>Update Role</CardTitle>
                        <CardAction>
                            <Link href={'/roles'}>
                                <Button>Go back</Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <hr />
                    <CardContent>
                        <form onSubmit={submit}>
                            <div className='mb-4'>
                                <Label htmlFor='name'>Edit Name</Label>
                                <Input id='name' type='text' name='name' value={data.name} onChange={(e) => setData('name', e.target.value)} 
                                aria-invalid={!!errors.name}
                                />
                                <InputError message={errors.name} />

                            </div>
                            <Label>Select Permission</Label>
                            <div className='my-4'>
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                                    {permissions.map((permission, index) => (
                                        <div key={index} className='flex items-center gap-3'>
                                            <Checkbox
                                                id={permission}
                                                checked={data.permissions.includes(permission)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                    setData('permissions', [...data.permissions, permission]);
                                                    } else {
                                                    setData('permissions', data.permissions.filter((p) => p !== permission));
                                                    }
                                                }}
                                                />
                                            <Label htmlFor={permission}>{permission}</Label>
                                        </div>
                                        ))}

                                </div>
                            </div>
                            <div className='flex justify-end'>
                                            <Button type='submit' disabled={processing} size={'lg'}>Update</Button>
                            </div>
                            
                        </form>
                    </CardContent>

                </Card>
 

            </div>
        </AppLayout>
    );
}