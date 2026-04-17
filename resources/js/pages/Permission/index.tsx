import {useEffect, useState} from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import {toast} from 'sonner';
import { Permission, SinglePermission } from '@/types/role_permission';
import TablePagination from '@/components/ui/table-pagination';
import { Can } from '@/components/PermissionGate';



const breadcrumbs: BreadcrumbItem[] = [{ title: 'Permission', href: '/permission' }];


export default function Permissions({ permission} : {permission : Permission}) {
    const [openAddPermissionDialog, setOpenAddPermissionDialog] = useState(false);
    const [openEditPermissionDialog, setOpenEditPermissionDialog] = useState(false);
    const {data, setData, post, put, delete: destroy ,processing, errors, reset} = useForm({
        id: 0,
        name: ''
    })

const {flash} = usePage<{flash: {message?: string}}>().props; 

useEffect(() => {
    if(flash.message){
        setOpenAddPermissionDialog(false);
        setOpenEditPermissionDialog(false);
        toast.success(flash.message);
    }
}, [flash.message])

function submit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    post('/permissions', {
        onSuccess: () => {
            reset('name');
            setOpenAddPermissionDialog(false);
        }
    })
}
function edit(permission: SinglePermission){
    setData('name', permission.name);
    setData('id', permission.id);
    setOpenEditPermissionDialog(true);
}

function update(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    put(`/permissions/${data.id}`, {
        onSuccess: () => {
            reset('name');
            setOpenEditPermissionDialog(false);
        }
    });
}

function deletePermission(id: number){
    destroy(`/permissions/${id}`)
}

  const { auth } = usePage().props as any;
  const role = auth.user.role;
    return (
        <Can permission="view_permissions" role={role}>
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permission" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader className='flex justify-between items-center'>
                        <CardTitle>Permissions Management</CardTitle>
                        <CardAction>
                            <Can permission="create_permissions">
                            <Button
                            onClick={() => {
                                setOpenAddPermissionDialog(true);
                            }}
                            >Add new</Button>
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
                                    <TableHead>Created at</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permission.data.map((permission, index) => (
                                    <TableRow>
                                        <TableCell>{index+1}</TableCell>
                                        <TableCell>{permission.name}</TableCell>
                                        <TableCell>{permission.created_at}</TableCell>
                                        <TableCell>
                                            <Can permission="edit_permissions">
                                            <Button variant={'outline'} onClick={() => edit(permission)}>Edit</Button>
                                            </Can>
                                            <Can permission="delete_permissions">
                                            <Button variant={'destructive'} className='ml-2' onClick={()=> deletePermission(permission.id)}>Delete</Button>
                                            </Can>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {permission.data.length > 0 ?(
                        <TablePagination total={permission.total} from={permission.from} to={permission.to} links={permission.links}/>
                    ):(
                        <div className='flex h-full items-center justify-center'>No results found</div>
                    )}
                </Card>

                <Dialog open={openAddPermissionDialog} onOpenChange={setOpenAddPermissionDialog}>
                    
                        <DialogContent className='sm:max-w-[425px]'>
                            <DialogHeader>
                                <DialogTitle>Add new permission</DialogTitle>
                            </DialogHeader>
                            <hr />
                <form onSubmit={submit}>
                            <div className='grip gap-4'>
                                <div className='grid gap-3'>
                                    <label htmlFor='name'>Permission Name</label>
                                    <Input id="name" type='text' value={data.name} onChange={(e)=> setData('name', e.target.value)}
                                    aria-invalid={!!errors}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <DialogFooter className='mt-2'>
                                <DialogClose asChild>
                                    <Button>Cancel</Button>
                                </DialogClose>
                                <Button type='submit' disabled={processing}>
                                    {processing && <Loader2 className='animate-spin'/>}
                                    <span>Create</span></Button>
                            </DialogFooter>
                </form>
                        </DialogContent>
                    
                </Dialog>


                                {/* for edit permission*/}
                <Dialog open={openEditPermissionDialog} onOpenChange={setOpenEditPermissionDialog}>
                    
                        <DialogContent className='sm:max-w-[425px]'>
                            <DialogHeader>
                                <DialogTitle>Edit permission</DialogTitle>
                            </DialogHeader>
                            <hr />
                <form onSubmit={update}>
                            <div className='grip gap-4'>
                                <div className='grid gap-3'>
                                    <label htmlFor='name'>Permission Name</label>
                                    <Input 
                                    id="name" 
                                    type='text' 
                                    value={data.name} 
                                    onChange={(e)=> setData('name', e.target.value)}
                                    aria-invalid={!!errors}
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>
                            <DialogFooter className='mt-2'>
                                <DialogClose asChild>
                                    <Button>Cancel</Button>
                                </DialogClose>
                                <Button type='submit' disabled={processing}>
                                    {processing && <Loader2 className='animate-spin'/>}
                                    <span>Update</span></Button>
                            </DialogFooter>
                </form>
                        </DialogContent>
                    
                </Dialog>

            </div>
        </AppLayout>
        </Can>
    );
}