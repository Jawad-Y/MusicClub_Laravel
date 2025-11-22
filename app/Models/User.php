<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'role_id',
        'status',
    ];

    // Relationships

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function ledDepartments()
    {
        return $this->hasMany(Department::class, 'leader_id');
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }
}
