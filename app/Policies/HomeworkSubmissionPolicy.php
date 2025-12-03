<?php

namespace App\Policies;

use App\Models\HomeworkSubmission;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class HomeworkSubmissionPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders and class leaders to view homework submissions
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, HomeworkSubmission $homeworkSubmission): bool
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
    public function update(User $user, HomeworkSubmission $homeworkSubmission): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, HomeworkSubmission $homeworkSubmission): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, HomeworkSubmission $homeworkSubmission): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, HomeworkSubmission $homeworkSubmission): bool
    {
        return false;
    }
}
