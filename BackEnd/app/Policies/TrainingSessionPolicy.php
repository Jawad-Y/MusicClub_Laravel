<?php

namespace App\Policies;

use App\Models\TrainingSession;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TrainingSessionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders, class leaders and trainers to view training sessions for their classes
        if ($user->isDepartmentLeader() || $user->isClassLeader() || $user->isTrainer()) {
            return true;
        }

        // Individual Affair can view all training sessions (read-only)
        $roleName = strtolower($user->role->role_name ?? '');
        if ($roleName === 'individual affair') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TrainingSession $trainingSession): bool
    {
        // Department leaders can view sessions for their department's classes
        if ($user->isDepartmentLeader()) {
            $classIds = $user->getAccessibleClassIds();
            return in_array($trainingSession->class_id, $classIds);
        }

        // Class leaders can view sessions for their classes
        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return in_array($trainingSession->class_id, $classIds);
        }

        // Trainers can view sessions for classes they are members of
        if ($user->isTrainer()) {
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return in_array($trainingSession->class_id, $classIds);
        }

        // Individual Affair can view any training session
        $roleName = strtolower($user->role->role_name ?? '');
        if ($roleName === 'individual affair') {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Allow trainers to create training sessions
        if ($user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TrainingSession $trainingSession): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TrainingSession $trainingSession): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TrainingSession $trainingSession): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TrainingSession $trainingSession): bool
    {
        return false;
    }
}
