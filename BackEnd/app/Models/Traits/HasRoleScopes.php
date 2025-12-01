<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasRoleScopes
{
    /**
     * Check if the user is a Leader (top level)
     */
    public function isLeader(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'leader';
    }

    /**
     * Check if the user is a Department Leader
     */
    public function isDepartmentLeader(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'department leader';
    }

    /**
     * Check if the user is a Class Leader
     */
    public function isClassLeader(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'class leader';
    }

    /**
     * Check if the user is a Trainer
     */
    public function isTrainer(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'trainer';
    }

    /**
     * Check if the user is a Trainee
     */
    public function isTrainee(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'trainee';
    }

    /**
     * Check if the user is an Inventory Manager
     */
    public function isInventoryManager(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'inventory manager';
    }

    /**
     * Check if the user is a Member
     */
    public function isMember(): bool
    {
        return $this->role && strtolower($this->role->role_name) === 'member';
    }

    /**
     * Get all department IDs this user can access
     */
    public function getAccessibleDepartmentIds(): array
    {
        if ($this->isLeader()) {
            // Leaders can access all departments
            return \App\Models\Department::pluck('id')->toArray();
        }

        if ($this->isDepartmentLeader()) {
            // Department leaders can access their own departments
            return $this->ledDepartments()->pluck('id')->toArray();
        }

        if ($this->isClassLeader()) {
            // Class leaders can access departments through their classes
            return $this->ledClasses()->pluck('department_id')->unique()->toArray();
        }

        return [];
    }

    /**
     * Get all class IDs this user can access
     */
    public function getAccessibleClassIds(): array
    {
        if ($this->isLeader()) {
            // Leaders can access all classes
            return \App\Models\Clas::pluck('id')->toArray();
        }

        if ($this->isDepartmentLeader()) {
            // Department leaders can access classes in their departments
            $departmentIds = $this->ledDepartments()->pluck('id')->toArray();
            return \App\Models\Clas::whereIn('department_id', $departmentIds)->pluck('id')->toArray();
        }

        if ($this->isClassLeader()) {
            // Class leaders can access their own classes
            return $this->ledClasses()->pluck('id')->toArray();
        }

        if ($this->isTrainee() || $this->isTrainer() || $this->isInventoryManager() || $this->isMember()) {
            // Trainees, trainers, inventory managers, and members can access classes they are members of
            return $this->classMembers()->pluck('classes.id')->toArray();
        }

        return [];
    }

    /**
     * Get all user IDs this user can access
     */
    public function getAccessibleUserIds(): array
    {
        if ($this->isLeader()) {
            // Leaders can access all users
            return \App\Models\User::pluck('id')->toArray();
        }

        if ($this->isDepartmentLeader()) {
            // Department leaders can access users in their department's classes
            $departmentIds = $this->ledDepartments()->pluck('id')->toArray();
            $classIds = \App\Models\Clas::whereIn('department_id', $departmentIds)->pluck('id')->toArray();
            
            return \App\Models\ClassMember::whereIn('class_id', $classIds)
                ->pluck('user_id')
                ->unique()
                ->toArray();
        }

        if ($this->isClassLeader()) {
            // Class leaders can access users in their classes
            $classIds = $this->ledClasses()->pluck('id')->toArray();
            
            return \App\Models\ClassMember::whereIn('class_id', $classIds)
                ->pluck('user_id')
                ->unique()
                ->toArray();
        }

        if ($this->isTrainee() || $this->isMember()) {
            // Trainees and members can only access members in the same classes
            $classIds = $this->classMembers()->pluck('classes.id')->toArray();
            
            return \App\Models\ClassMember::whereIn('class_id', $classIds)
                ->pluck('user_id')
                ->unique()
                ->toArray();
        }

        return [$this->id]; // Default: only themselves
    }

    /**
     * Scope query to users accessible by the given user
     */
    public function scopeAccessibleBy(Builder $query, $user): Builder
    {
        if (!$user) {
            return $query->whereRaw('1 = 0'); // No access
        }

        if ($user->isLeader()) {
            return $query; // Full access
        }

        if ($user->isDepartmentLeader()) {
            $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
            $classIds = \App\Models\Clas::whereIn('department_id', $departmentIds)->pluck('id')->toArray();
            
            return $query->whereHas('classMembers', function ($q) use ($classIds) {
                $q->whereIn('classes.id', $classIds);
            });
        }

        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            
            return $query->whereHas('classMembers', function ($q) use ($classIds) {
                $q->whereIn('classes.id', $classIds);
            });
        }

        if ($user->isTrainee() || $user->isMember()) {
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            
            return $query->whereHas('classMembers', function ($q) use ($classIds) {
                $q->whereIn('classes.id', $classIds);
            });
        }

        return $query->where('id', $user->id); // Default: only themselves
    }
}
