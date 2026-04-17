<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ApplicantView extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'application_id',
        'field_key',
        'paid',
    ];
    public function company()
    {
        return $this->belongsTo(User::class, 'company_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
