<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Flier extends Model

{

    protected $fillable = [

        'user_id', 'company_id', 'title',

        'description', 'file_path', 'file_type',

        'status', 'rejection_reason',

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
 