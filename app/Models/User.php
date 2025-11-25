<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'role_id',
        'status',
        'password',
    ];

    // Hide sensitive fields when serializing the model
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Casts for specific fields
    protected $casts = [
        'email_verified_at' => 'datetime',
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

    // Helper method to check if user can create accounts
    public function canCreateAccounts(): bool
    {
        if (!$this->role) {
            return false;
        }

        $name = strtolower($this->role->role_name);

        return in_array($name, [
            'leader',
            'individual affair',
        ]);
    }
}