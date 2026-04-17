<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyMarketing extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'listing_title',
        'listing_description',
        'logo_path',
        'target_profile',
        'preferred_contact_method',
    ];

    public function company() { return $this->belongsTo(Company::class); }
}
