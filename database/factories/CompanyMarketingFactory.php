<?php

namespace Database\Factories;

use App\Models\CompanyMarketing;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyMarketingFactory extends Factory
{
    protected $model = CompanyMarketing::class;

    public function definition(): array
    {
        return [
            'listing_title'            => $this->faker->catchPhrase,
            'listing_description'      => $this->faker->paragraph(3),
            'logo_path'                => null,
            'target_profile'           => $this->faker->sentence(4),
            'preferred_contact_method' => $this->faker->randomElement(['email', 'phone']),
        ];
    }
}
