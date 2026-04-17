<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Financial extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'income_source',
        'monthly_income',
        'other_income',
        'monthly_expenses',
        'existing_loans',
    ];

    /**
     * Get the user that owns the financial info.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
