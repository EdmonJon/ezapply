<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        return [
            'company_name'            => $this->faker->company,
            'brand_name'              => $this->faker->companySuffix,
            'city'                    => $this->faker->city,
            'state_province'          => $this->faker->state,
            'zip_code'                => $this->faker->postcode,
            'country'                 => $this->faker->country,
            'company_website'         => $this->faker->url,
            'description'             => $this->faker->paragraph(3),
            'year_founded'            => $this->faker->year,
            'num_franchise_locations' => $this->faker->numberBetween(0, 200),
        ];
    }
}
