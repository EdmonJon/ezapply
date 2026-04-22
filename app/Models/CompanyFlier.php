<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyFlier extends Model
{
    protected $fillable = ['company_id', "file_path", 'caption'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}