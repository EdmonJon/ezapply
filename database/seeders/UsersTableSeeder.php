<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        // for admin
        $admin = User::create([
            'email'      => 'admin@example.com',
            'password'   => Hash::make('password123'),
        ]);
        $admin->assignRole('super_admin');

        // for customer
        $customer = User::create([
            'email'      => 'customer@sample.com',
            'password'   => Hash::make('password123'),
        ]);
        $customer->assignRole('customer');

        // for company
        $company = User::create([
            'email'      => 'company@sample.com',
            'password'   => Hash::make('password123'),
        ]);
        $company->markEmailAsVerified();
        $company->assignRole('company');
        $company->credit()->create(['balance' => 200]);
    }
}
