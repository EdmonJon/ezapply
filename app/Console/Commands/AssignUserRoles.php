<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class AssignUserRoles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:assign-user-roles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assign roles to existing users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking existing users and assigning roles...');
        
        $users = User::all();
        
        foreach ($users as $user) {
            $this->info("User: {$user->email} - Current roles: " . $user->roles->pluck('name')->join(', ') ?: 'None');
            
            // Assign roles based on email
            if ($user->email === 'admin@example.com') {
                if (!$user->hasRole('super_admin')) {
                    $user->assignRole('super_admin');
                    $this->info("  ✓ Assigned 'super_admin' role");
                }
            } elseif ($user->email === 'customer@example.com') {
                if (!$user->hasRole('customer')) {
                    $user->assignRole('customer');
                    $this->info("  ✓ Assigned 'customer' role");
                }
            } else {
                // For other users, assign customer role by default
                if (!$user->hasRole('customer')) {
                    $user->assignRole('customer');
                    $this->info("  ✓ Assigned 'customer' role (default)");
                }
            }
        }
        
        $this->info('Role assignment completed!');
    }
}
