<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyOpportunity extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'franchise_type',
        'min_investment',
        'franchise_fee',
        'royalty_fee_structure',
        'avg_annual_revenue',
        'target_markets',
        'training_support',
        'franchise_term',
        'unique_selling_points',
    ];

    protected $casts = [
        'min_investment'     => 'decimal:2',
        'franchise_fee'      => 'decimal:2',
        'avg_annual_revenue' => 'decimal:2',
    ];

    public function company() { return $this->belongsTo(Company::class); }
}
