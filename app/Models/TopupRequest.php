<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TopupRequest extends Model
{
    protected $fillable = [
        'user_id', 'amount', 'proof_of_payment',
        'status', 'admin_note', 'reviewed_by', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}