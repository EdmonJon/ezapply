<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BasicInfo extends Model
{
    use HasFactory;

    protected $table = 'basicinfo';

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'address_id',
        'birth_date',
        'phone',
        'Facebook',
        'LinkedIn',
        'Viber',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Get the user that owns the basic info.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the address associated with the basic info.
     */
    public function basicInfo()
{
    return $this->hasOne(BasicInfo::class, 'user_id');
}
    public function address(): BelongsTo
    {
        return $this->belongsTo(UserAddress::class, 'address_id');
    }
}
