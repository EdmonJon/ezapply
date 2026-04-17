<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EzCoinLoadHistory extends Model
{
    protected $table = 'ezcoin_load_histories';

    protected $fillable = [
        'company_id',
        'ezcoin_loaded',
        'bonus_coins',
        'loaded_by',
        'admin_id',
        'notes',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
