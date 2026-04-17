<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;



class PermissionController extends Controller
{
    //
    public function index(){
        $permission = Permission::latest()->paginate(5);
        $permission->getCollection()->transform(function($permission){
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'created_at'=> $permission->created_at->format('d-m-Y')
                ];
        });

        return Inertia::render('Permission/index', [
            'permission' => $permission
            ]);
    }

    public function store(Request $request){
        Permission::create($request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name']
    ]));
    return to_route('permissions.index')->with('message','Permission Created Successfully');
    }

    public function update(Request $request, Permission $permission){
        $permission->update($request->validate([
            'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
            ]));
            return to_route('permissions.index')->with('message', 'Permission Updated Successfully');
    }

    public function destroy(Permission $permission){
        $permission->delete();
        
        return to_route('permissions.index')->with('message', 'Permission Deleted Successfully');
    }
}
