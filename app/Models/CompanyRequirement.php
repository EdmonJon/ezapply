<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'min_net_worth',
        'min_liquid_assets',
        'prior_experience', 
        'experience_type',
        'other_qualifications',
    ];

    protected $casts = [
        'min_net_worth'     => 'decimal:2',
        'min_liquid_assets' => 'decimal:2',
        'prior_experience'  => 'boolean',
    ];

    public function company() { return $this->belongsTo(Company::class); }
}
