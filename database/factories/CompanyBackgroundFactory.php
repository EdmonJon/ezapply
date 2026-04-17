<?php

namespace Database\Factories;

use App\Models\CompanyBackground;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyBackgroundFactory extends Factory
{
    protected $model = CompanyBackground::class;

    public function definition(): array
    {
        return [
            'industry_sector'    => $this->faker->randomElement(['Technology', 'Healthcare', 'Retail']),
            'years_in_operation' => $this->faker->numberBetween(1, 50),
            'total_revenue'      => $this->faker->numberBetween(100000, 50000000),
            'awards'             => $this->faker->sentence(3),
            'company_history'    => $this->faker->paragraph(4),
        ];
    }
}
