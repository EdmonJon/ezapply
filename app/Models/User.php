<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Models\Role;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'password',
        'credits',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'credits' => 'integer',
        ];
    }

    /**
     * Full name accessor
     */
    public function getNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function address()
{
    return $this->hasOne(UserAddress::class ,'user_id');
}
    public function company()
{
    return $this->hasOne(Company::class, 'user_id');
}

// applications as customer
public function applications()
{
    return $this->hasMany(Application::class, 'user_id');
}

// companies this user owns (if role=company)
public function companies()
{
    return $this->hasMany(Company::class);
}

// affiliations
public function affiliations()
{
    return $this->hasMany(\App\Models\Affiliation::class, 'user_id');
}

// basic info
public function basicInfo()
{
    return $this->hasOne(BasicInfo::class, 'user_id');
}

// financial info
public function financial()
{
    return $this->hasOne(Financial::class, 'user_id');
}

// customer attachments
public function attachments()
{
    return $this->hasMany(CustomerAttachment::class, 'user_id');
}


    /**
     * Get the user's primary role (using Spatie's role system)
     */
    public function getPrimaryRoleAttribute()
    {
        return $this->roles()->first();
    }


    public function credit()
{
    return $this->hasOne(UserCredit::class);
}

public function creditTransactions()
{
    return $this->hasMany(CreditTransaction::class);
}

    public function checkProfileStatus()
    {
        $hasBasicInfo = $this->basicInfo && $this->basicInfo->first_name ? true : false;
        $hasFinancial = $this->financial && $this->financial->income_source ? true : false;

        return [
            'complete' => $hasBasicInfo && $hasFinancial,
            'hasAnyData' => $hasBasicInfo || $hasFinancial,
        ];
    }
    public function assignedCompanies()
{
    return $this->belongsToMany(Company::class, 'company_agent', 'user_id', 'company_id')
                ->withTimestamps();
}

}
