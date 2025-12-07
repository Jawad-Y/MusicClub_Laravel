<?php

namespace App\Policies;

use App\Models\ReportsLog;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Database\Eloquent\Builder;

class ReportsLogPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view logs (scoped to their access level)
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ReportsLog $reportsLog): bool
    {
        // Load the role relationship
        $user->load('role');
        
        // Admin and Leader can view all logs
        if (in_array($user->role->role_name, ['Admin', 'Leader'])) {
            return true;
        }

        // Department Leader can view their department's logs
        if ($user->role->role_name === 'Department Leader') {
            return $reportsLog->department_id && $user->ledDepartments()
                ->where('id', $reportsLog->department_id)
                ->exists();
        }

        // Class Leader and Trainer can view their class logs
        if (in_array($user->role->role_name, ['Class Leader', 'Trainer'])) {
            return $reportsLog->class_id && (
                $user->ledClasses()->where('id', $reportsLog->class_id)->exists() ||
                $user->trainingSessions()->where('class_id', $reportsLog->class_id)->exists()
            );
        }

        // Members can only view their own logs
        return $reportsLog->created_by == $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Load the role relationship
        $user->load('role');
        
        // Only Admin and Leader can create logs
        return in_array($user->role->role_name, ['Admin', 'Leader']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ReportsLog $reportsLog): bool
    {
        // Load the role relationship
        $user->load('role');
        
        // Only Admin and Leader can update logs
        return in_array($user->role->role_name, ['Admin', 'Leader']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ReportsLog $reportsLog): bool
    {
        // Load the role relationship
        $user->load('role');
        
        // Only Admin and Leader can delete logs
        return in_array($user->role->role_name, ['Admin', 'Leader']);
    }

    /**
     * Scope the query based on user's role and access level.
     */
    public function scopeViewable(User $user, Builder $query): Builder
    {
        // Load the role relationship
        $user->load('role');
        
        // Admin and Leader can see all logs
        if (in_array($user->role->role_name, ['Admin', 'Leader'])) {
            return $query;
        }

        // Department Leader can see their department's logs
        if ($user->role->role_name === 'Department Leader') {
            $departmentIds = $user->ledDepartments()->pluck('id');
            return $query->whereIn('department_id', $departmentIds)
                ->orWhere('created_by', $user->id);
        }

        // Class Leader and Trainer can see their class logs
        if (in_array($user->role->role_name, ['Class Leader', 'Trainer'])) {
            $classIds = $user->ledClasses()->pluck('id')
                ->merge($user->trainingSessions()->pluck('class_id'));
            return $query->whereIn('class_id', $classIds)
                ->orWhere('created_by', $user->id);
        }

        // Members can only see their own logs
        return $query->where('created_by', $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ReportsLog $reportsLog): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ReportsLog $reportsLog): bool
    {
        return false;
    }
}

