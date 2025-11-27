<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $fillable = [
        'department_name',
        'leader_id',
    ];

    // Relationships

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function userAssignments()
    {
        return $this->hasMany(UserAssignment::class);
    }

    public function classes()
    {
        return $this->hasMany(Clas::class);
    }

    /**
     * Scope departments accessible by the given user based on their role
     */
    public function scopeAccessibleBy(Builder $query, $user): Builder
    {
        if (!$user) {
            return $query->whereRaw('1 = 0'); // No access
        }

        if ($user->isLeader()) {
            return $query; // Full access to all departments
        }

        if ($user->isDepartmentLeader()) {
            // Department leaders can access their own departments
            $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
            return $query->whereIn('id', $departmentIds);
        }

        if ($user->isClassLeader()) {
            // Class leaders can access departments through their classes
            $departmentIds = $user->ledClasses()->pluck('department_id')->unique()->toArray();
            return $query->whereIn('id', $departmentIds);
        }

        return $query->whereRaw('1 = 0'); // No access by default
    }
}