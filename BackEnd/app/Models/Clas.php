<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class Clas extends Model
{
    protected $table = 'classes';
    
    protected $fillable = [
        'class_name',
        'department_id',
        'class_leader_id',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function classLeader(): BelongsTo
    {
        // Exclude admin users from class leader relationship
        return $this->belongsTo(User::class, 'class_leader_id')
            ->whereHas('role', function($q) {
                $q->whereRaw('LOWER(role_name) != ?', ['admin']);
            });
    }
    
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_members', 'class_id', 'user_id')   
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Scope classes accessible by the given user based on their role
     */
    public function scopeAccessibleBy(Builder $query, $user): Builder
    {
        if (!$user) {
            return $query->whereRaw('1 = 0'); // No access
        }

        if ($user->isAdmin() || $user->isLeader()) {
            return $query; // Full access to all classes
        }

        if ($user->isDepartmentLeader()) {
            // Department leaders can access classes in their departments
            $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
            return $query->whereIn('department_id', $departmentIds);
        }

        if ($user->isClassLeader()) {
            // Class leaders can access their own classes
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return $query->whereIn('id', $classIds);
        }

        if ($user->isTrainee() || $user->isTrainer() || $user->isMember()) {
            // Trainees, trainers, and members can access classes they are members of
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereIn('id', $classIds);
        }

        return $query->whereRaw('1 = 0'); // No access by default
    }
}