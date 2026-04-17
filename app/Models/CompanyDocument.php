<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyDocument extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_id',
        'dti_sbc_path',
        'bir_2303_path',
        'ipo_registration_path',
    ];

    /**
     * Get the company that owns the document.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}