<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_id',
        'desired_location',
        'deadline_date',
        'status',
    ];

    protected $casts = [
        'deadline_date' => 'date',
    ];

    // relationships
    public function user()
    {
        return $this->belongsTo(User::class,'user_id');
    }    

    public function company()
    {
        return $this->belongsTo(Company::class,'company_id');
    }
}
