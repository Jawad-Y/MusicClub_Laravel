<?php

namespace App\Policies;

use App\Models\ClothingAssignment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClothingAssignmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow inventory managers full access
        if ($user->isInventoryManager()) {
            return true;
        }

        // Allow department leaders and class leaders to view clothing assignments
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClothingAssignment $clothingAssignment): bool
    {
        // Allow inventory managers full access
        if ($user->isInventoryManager()) {
            return true;
        }

        // Department leaders and class leaders can only view assignments for users in their enrolled classes
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            return in_array($clothingAssignment->user_id, $accessibleUserIds);
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
    public function update(User $user, ClothingAssignment $clothingAssignment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClothingAssignment $clothingAssignment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ClothingAssignment $clothingAssignment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ClothingAssignment $clothingAssignment): bool
    {
        return false;
    }
}
