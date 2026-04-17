<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FranchiseInformation extends Model
{
    protected $table = 'franchise_information';

    protected $fillable = [
        'user_id',
        'net_worth',
        'liquid_assets',
        'source_of_funds',
        'annual_income',
        'investment_budget',
        'location',
        'franchise_type',
        'timeline',
        
    ];

    protected $casts = [
        'interested_companies' => 'array',
    ];
}


