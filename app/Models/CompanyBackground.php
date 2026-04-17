<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyBackground extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'industry_sector',
        'years_in_operation',
        'total_revenue',
        'awards',
        'company_history',
    ];

    protected $casts = [
        'years_in_operation' => 'integer',
        'total_revenue'      => 'decimal:2',
    ];

    public function company() { return $this->belongsTo(Company::class); }
}
