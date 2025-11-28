<?php

namespace App\Policies;

use App\Models\SessionAttendance;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SessionAttendancePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders and class leaders to view session attendance
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SessionAttendance $sessionAttendance): bool
    {
        // Department leaders and class leaders use accessibleBy scope in the model
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true; // Filtered by controller using accessibleBy scope
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SessionAttendance $sessionAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SessionAttendance $sessionAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SessionAttendance $sessionAttendance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SessionAttendance $sessionAttendance): bool
    {
        return false;
    }
}
