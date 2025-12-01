<?php

namespace App\Policies;

use App\Models\Homework;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class HomeworkPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders, class leaders and trainers to view homework
        if ($user->isDepartmentLeader() || $user->isClassLeader() || $user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Homework $homework): bool
    {
        // Department leaders, class leaders and trainers use accessibleBy scope in the model
        if ($user->isDepartmentLeader() || $user->isClassLeader() || $user->isTrainer()) {
            return true; // Filtered by controller using accessibleBy scope
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Allow trainers to create homework
        if ($user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Homework $homework): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Homework $homework): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Homework $homework): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Homework $homework): bool
    {
        return false;
    }
}
