<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = [
        'user_id', 'company_id', 'title', 'description',
        'file_path', 'file_type', 'placement',
        'start_date', 'end_date', 'daily_cost',
        'estimated_total_cost', 'status', 'last_deducted_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'last_deducted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}