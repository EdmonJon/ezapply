<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\UserCredit;
use App\Models\Company;
use App\Models\CompanyOpportunity;
use App\Models\CompanyBackground;
use App\Models\CompanyRequirement;
use App\Models\CompanyMarketing;
use App\Models\CompanyDocument;

class PfaCompanySeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/pfa_members_combined.json');

        if (!File::exists($path)) {
            $this->command->error(" JSON file not found at: {$path}");
            return;
        }

        $rows = json_decode(File::get($path), true);
        $rows = array_map(function ($item) {
        $normalized = [];
        foreach ($item as $key => $value) {
            $normalized[trim(str_replace(':', '', $key))] = $value; // remove colons
        }
        return $normalized;
    }, $rows);

        $this->command->info("Found " . count($rows) . " companies in JSON.");

        foreach ($rows as $item) {
            try {
                
                $companyName = trim($item['company_name'] ?? 'Unknown Company');
                $brandName = trim($item['name'] ?? 'Unknown Brand');
                $price = $item['price'] ?? null;

                // Create or find a user for the company (unique email per company)
                $email = Str::slug($companyName) . '@pfa-demo.com';
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'password' => bcrypt('password123'),
                        'credits' => 200,
                    ]
                );

                $user->assignRole('company');
                
                UserCredit::updateOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 200]
                );

                $userId = $user->id;

                // DEFAULTS: ensure fields that might be NON-NULL in DB are present
                $defaults = [
                    'brand_name' => $brandName,
                    'city' => $item['city'] ?? $item['citymun_name'] ?? 'unknown',
                    'state_province' => $item['state_province'] ?? $item['province_name'] ?? 'unknown',
                    'zip_code' => $item['zip_code'] ?? $item['postal_code'] ?? 'unknown',
                    'region_code' => $item['region_code'] ?? 'unknown',
                    'region_name' => $item['region_name'] ?? 'unknown',
                    'province_code' => $item['province_code'] ?? 'unknown',
                    'province_name' => $item['province_name'] ?? 'unknown',
                    'citymun_code' => $item['citymun_code'] ?? 'unknown',
                    'citymun_name' => $item['citymun_name'] ?? 'unknown',
                    'barangay_code' => $item['barangay_code'] ?? 'unknown',
                    'barangay_name' => $item['barangay_name'] ?? 'unknown',
                    'postal_code' => $item['postal_code'] ?? 'unknown',
                    'country' => $item['country'] ?? 'Philippines',
                    'company_website' => $item['website'] ?? null,
                    'description' => trim($item['company_profile'] ?? null),
                    'year_founded' => isset($item['year'])  && is_numeric($item['year']) ? (int)$item['year'] : 2000,
                    'num_franchise_locations' => isset($item['num_franchise_locations']) && is_numeric($item['num_franchise_locations']) ? (int)$item['num_franchise_locations']
                        : null,
                    'status' => 'approved',
                ];

                // Create or update the company
                $company = Company::updateOrCreate(
                    ['company_name' => $companyName],
                    array_merge($defaults, ['user_id' => $userId])
                );

                $this->command->line(
                "💰 {$brandName} - Investment: " 
                . json_encode($item['CAPITAL INVESTMENT'] ?? $price ?? null)
                . " → Parsed: " . self::parseMoney($item['CAPITAL INVESTMENT'] ?? $price ?? 0)
                . " | Fee: " . json_encode($item['FRANCHISE FEE'] ?? null)
                . " → Parsed: " . self::parseMoney($item['FRANCHISE FEE'] ?? 0)
            );
                // Opportunity
                CompanyOpportunity::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'franchise_type' => $item['franchise_type'] ?? $this->guessIndustry($companyName),
                        'min_investment' => self::parseMoney($item['CAPITAL INVESTMENT'] ?? 0),
                        'franchise_fee' => self::parseMoney($item['FRANCHISE FEE'] ?? 0),
                        'royalty_fee_structure' => $item['ROYALTY FEE'] ?? 0,
                        'avg_annual_revenue' => $item['avg_annual_revenue'] ?? null,
                        'target_markets' => $item['target_markets'] ?? 'Unknown',
                        'training_support' => $item['training_support'] ?? null,
                        'franchise_term' => $item['TERM OF FRANCHISE AGREEMENT'] ?? 0,
                        'unique_selling_points' => $item['unique_selling_points'] ?? null,
                        // 'renewal' => $item['RENEWAL'] ?? null,
                    ]
                );

                // Background
                CompanyBackground::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'industry_sector' => $item['industry_sector'] ?? $this->guessIndustry($companyName),
                        'years_in_operation' => is_numeric($item['years_in_operation'] ?? null)
                        ? (int)$item['years_in_operation']
                        : 0,
                        'total_revenue' => self::parseMoney($item['total_revenue'] ?? 0),
                        'awards' => $item['awards'] ?? 'unknown',
                        'company_history' => $item['company_history'] ?? 'unknown',
                    ]
                );

                // Requirements
                CompanyRequirement::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'min_net_worth' => $item['min_net_worth'] ?? 0,
                        'min_liquid_assets' => $item['min_liquid_assets'] ?? 0,
                        'prior_experience' => $item['prior_experience'] ?? false,
                        'experience_type' => $item['experience_type'] ?? 'unknown',
                        'other_qualifications' => $item['other_qualifications'] ?? 'unknown',
                    ]
                );

                // Marketing
                CompanyMarketing::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'listing_title' => $item['listing_title'] ?? $companyName,
                        'listing_description' => $item['listing_description'] ?? 'unknown',
                        'logo_path' => $item['img'] ?? 'unknown',
                        'target_profile' => $item['target_profile'] ?? 'unknown',
                        'preferred_contact_method' => $item['preferred_contact_method'] ?? 'unknown',
                    ]
                );

                // Documents (placeholder entries)
                CompanyDocument::updateOrCreate(
                    ['company_id' => $company->id],
                    [
                        'dti_sbc_path' => $item['dti_sbc_path'] ?? 'unknown',
                        'bir_2303_path' => $item['bir_2303_path'] ?? 'unknown',
                        'ipo_registration_path' => $item['ipo_registration_path'] ?? 'unknown',
                    ]
                );

                $this->command->info("Seeded: {$companyName}. User ID: {$userId}");
            } catch (\Exception $e) {
                $this->command->warn("Failed to seed company: " . ($item['name'] ?? 'unknown'));
                $this->command->warn($e->getMessage());
            }
        }

        $this->command->info(" Finished seeding PFA companies!");
    }

private static function parseMoney($value)
{
    if ($value === null || trim((string)$value) === '') {
        return 0.0;
    }

    // Normalize
    $value = strtoupper(trim((string)$value));

    // Detect ranges like "Php 500K - Php 1M"
    if (preg_match('/[-–]/', $value)) {
        $parts = preg_split('/[-–]/', $value);
        $nums = array_map(fn($v) => self::parseMoney($v), $parts);
        $nums = array_filter($nums);
        return count($nums) ? array_sum($nums) / count($nums) : 0.0;
    }

    // Determine multiplier (allow things like "1.5M", "2 M", "14MILLION")
    $multiplier = 1;
    if (preg_match('/MILLION|[0-9.]+M/', $value)) {
        $multiplier = 1_000_000;
    } elseif (preg_match('/THOUSAND|[0-9.]+K/', $value)) {
        $multiplier = 1_000;
    }

    // Remove all non-numeric chars except dot
    $clean = preg_replace('/[^0-9.]/', '', $value);

    // Convert to float
    $num = is_numeric($clean) ? (float)$clean : 0.0;

    return $num * $multiplier;
}


    private function guessIndustry($name)
    {
        $n = strtolower($name);
        if (str_contains($n, 'coffee') || str_contains($n, 'cafe') || str_contains($n, 'bakery') || str_contains($n, 'tea') || str_contains($n, 'milk') || str_contains($n, 'restaurant') ||
        str_contains($n, 'burger') ||
        str_contains($n, 'pizza') ||
        str_contains($n, 'ice cream') ||
        str_contains($n, 'shake') ||
        str_contains($n, 'fried') ||
        str_contains($n, 'grill') ||
        str_contains($n, 'Food')) { return 'Food & Beverage'; }
        if (str_contains($n, 'spa') || str_contains($n, 'salon') || str_contains($n, 'nail') ||
        str_contains($n, 'beauty') ||
        str_contains($n, 'wellness') ||
        str_contains($n, 'gym') ||
        str_contains($n, 'fitness')) { return 'Health & Beauty'; }
        if (str_contains($n, 'school') || str_contains($n, 'academy') ||
        str_contains($n, 'training') ||
        str_contains($n, 'learning')) { return 'Education'; }

        if (str_contains($n, 'store') || str_contains($n, 'shop') ||
        str_contains($n, 'boutique') ||
        str_contains($n, 'mart') ||
        str_contains($n, 'supermarket')) { return 'Retail'; }
        if (
        str_contains($n, 'service') ||
        str_contains($n, 'consulting') ||
        str_contains($n, 'solutions') ||
        str_contains($n, 'logistics') ||
        str_contains($n, 'cleaning')
    ) {
        return 'Services';
    }
        return 'General';
    }
}
