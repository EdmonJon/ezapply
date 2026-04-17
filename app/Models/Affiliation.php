<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Affiliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'institution',
        'position',
    ];

    /**
     * Get the user that owns the affiliation.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
