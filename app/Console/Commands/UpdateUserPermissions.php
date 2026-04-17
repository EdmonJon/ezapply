<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UpdateUserPermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-user-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update user permissions and reassign to roles';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating user permissions...');
        
        // Create new permissions if they don't exist
        $newPermissions = [
            'manage_own_companies',
            'apply_for_franchises',
            'view_customer_dashboard',
            'view_company_dashboard',
            'view_admin_dashboard',
        ];

        foreach ($newPermissions as $permission) {
            if (!Permission::where('name', $permission)->exists()) {
                Permission::create(['name' => $permission, 'guard_name' => 'web']);
                $this->info("Created permission: {$permission}");
            }
        }

        // Update role permissions
        $this->updateRolePermissions();
        
        $this->info('Permission update completed!');
    }

    private function updateRolePermissions()
    {
        // Super Admin - All permissions
        $superAdmin = Role::findByName('super_admin');
        $superAdmin->syncPermissions(Permission::all());
        $this->info('Updated super_admin permissions');

        // Company - Company and franchise management
        $company = Role::findByName('company');
        $company->syncPermissions([
            'view_companies',
            'create_companies',
            'edit_companies',
            'manage_own_companies',
            'view_franchises',
            'create_franchises',
            'edit_franchises',
            'view_company_dashboard',
            'view_settings',
            'edit_settings',
        ]);
        $this->info('Updated company permissions');

        // Customer - View and apply for franchises
        $customer = Role::findByName('customer');
        $customer->syncPermissions([
            'view_companies',
            'view_franchises',
            'apply_for_franchises',
            'view_customer_dashboard',
            'view_settings',
            'edit_settings',
        ]);
        $this->info('Updated customer permissions');
    }
}