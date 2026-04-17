<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionsTableSeeder extends Seeder
{
    public function run(): void
    {
        // clear cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'view_users', 'create_users', 'edit_users', 'delete_users',
            'view_roles', 'create_roles', 'edit_roles', 'delete_roles',
            'view_permissions', 'create_permissions', 'edit_permissions', 'delete_permissions',
            'view_companies', 'create_companies', 'edit_companies', 'delete_companies', 'manage_own_companies',
            'view_franchises', 'create_franchises', 'edit_franchises', 'delete_franchises', 'apply_for_franchises',
            'view_dashboard', 'view_admin_dashboard',
            'view_settings', 'edit_settings','view_request_companies','view_chats','view_applications','view_my_companies',
            'view_balance',
            // additional permissions referenced in UI
            'view_home_page',
            'view_customer_dashboard',
            'view_company_dashboard',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // assigning permissions to roles
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->givePermissionTo(Permission::all());

        $company = Role::firstOrCreate(['name' => 'company', 'guard_name' => 'web']);
        $company->givePermissionTo([
            'view_companies', 'create_companies', 'edit_companies', 'manage_own_companies',
            'view_franchises', 'create_franchises', 'edit_franchises',
            'view_dashboard', 'view_settings', 'edit_settings','view_applications','view_chats','view_my_companies',
            'view_balance',
            'view_company_dashboard',
        ]);

        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customer->givePermissionTo([
            'view_companies', 'view_franchises', 'apply_for_franchises',
            'view_dashboard', 'view_settings', 'edit_settings','view_chats',
            'view_customer_dashboard', 'view_home_page',
        ]);
    }
}
