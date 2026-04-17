<?php

namespace Database\Factories;

use App\Models\CompanyOpportunity;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyOpportunityFactory extends Factory
{
    protected $model = CompanyOpportunity::class;

    public function definition(): array
    {
        return [
            'franchise_type'        => $this->faker->randomElement(['Food & Beverage', 'Retail', 'Technology']),
            'min_investment'        => $this->faker->numberBetween(10000, 200000),
            'franchise_fee'         => $this->faker->numberBetween(5000, 50000),
            'royalty_fee_structure' => $this->faker->randomElement(['5% of sales', 'Fixed $500/month']),
            'avg_annual_revenue'    => $this->faker->numberBetween(100000, 5000000),
            'target_markets'        => $this->faker->country,
            'training_support'      => $this->faker->sentence(8),
            'franchise_term'        => $this->faker->numberBetween(5, 15) . ' years renewable',
            'unique_selling_points' => $this->faker->sentence(10),
        ];
    }
}
