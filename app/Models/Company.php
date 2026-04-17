<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User; 

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'brand_name',
        'city',
        'state_province',
        'zip_code',
        'region_code',
        'region_name',
        'province_code',
        'province_name',
        'citymun_code',
        'citymun_name',
        'barangay_code',
        'barangay_name',
        'postal_code',
        'country',
        'company_website',
        'description',
        'year_founded',
        'num_franchise_locations',
        'status',
        'user_id', 
    ];
    
    protected $attributes = [
        'status' => 'pending',
    ];


    protected $appends = [
        'agent_name',
    ];

    public function opportunity() { return $this->hasOne(CompanyOpportunity::class); }
    public function background()  { return $this->hasOne(CompanyBackground::class); }
    public function requirements(){ return $this->hasOne(CompanyRequirement::class); }
    public function marketing()   { return $this->hasOne(CompanyMarketing::class); }
    public function user()        { return $this->belongsTo(User::class); }
    public function documents()   { return $this->hasOne(CompanyDocument::class); }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function applicants()
    {
        return $this->belongsToMany(User::class, 'applications');
    }
    public function agents()
    {
        return $this->belongsToMany(User::class, 'company_agent', 'company_id', 'user_id')
            ->withPivot('id')
            ->withTimestamps();
    }

    protected function getAgentNameAttribute(): string
    {
        $basicInfo = optional($this->user)->basicInfo;

        if ($basicInfo) {
            return "{$basicInfo->first_name} {$basicInfo->last_name}";
        }
        return 'N/A';
        
      //  return optional($this->user)->email ?? 'N/A';
    }
    public function fliers() { return $this->hasMany(CompanyFlier::class); }

    
}