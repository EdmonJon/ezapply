<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'attachment_type',
        'attachment_path',
    ];

    /**
     * Get the user that owns the attachment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
