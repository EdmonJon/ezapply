<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;
    protected $table = 'users_address';
    protected $fillable = [
        'user_id',
        'region_code', 'region_name',
        'province_code', 'province_name',
        'citymun_code', 'citymun_name',
        'barangay_code', 'barangay_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

