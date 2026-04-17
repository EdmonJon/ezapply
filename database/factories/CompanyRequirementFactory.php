<?php

namespace Database\Factories;

use App\Models\CompanyRequirement;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyRequirementFactory extends Factory
{
    protected $model = CompanyRequirement::class;

    public function definition(): array
    {
        return [
            'min_net_worth'        => $this->faker->numberBetween(50000, 500000),
            'min_liquid_assets'    => $this->faker->numberBetween(10000, 100000),
            'prior_experience'     => $this->faker->boolean,
            'experience_type'      => $this->faker->randomElement([null, 'Retail', 'Food Industry', 'Technology']),
            'other_qualifications' => $this->faker->sentence(6),
        ];
    }
}
