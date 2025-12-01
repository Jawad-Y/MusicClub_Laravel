<?php

namespace App\Policies;

use App\Models\PerformanceReview;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PerformanceReviewPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders and trainers to view performance reviews
        if ($user->isDepartmentLeader() || $user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PerformanceReview $performanceReview): bool
    {
        // Allow department leaders and trainers to view performance reviews
        if ($user->isDepartmentLeader() || $user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Allow department leaders and trainers to create performance reviews
        if ($user->isDepartmentLeader() || $user->isTrainer()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PerformanceReview $performanceReview): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PerformanceReview $performanceReview): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PerformanceReview $performanceReview): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PerformanceReview $performanceReview): bool
    {
        return false;
    }
}
