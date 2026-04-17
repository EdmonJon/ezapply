<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            Company::factory(10)->create()->each(function ($company) {
                $company->opportunity()->create(\App\Models\CompanyOpportunity::factory()->make()->toArray());
                $company->background()->create(\App\Models\CompanyBackground::factory()->make()->toArray());
                $company->requirements()->create(\App\Models\CompanyRequirement::factory()->make()->toArray());
                $company->marketing()->create(\App\Models\CompanyMarketing::factory()->make()->toArray());
            });
        });
    }
}
