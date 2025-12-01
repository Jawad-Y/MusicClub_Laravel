<?php

namespace App\Policies;

use App\Models\Membership;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MembershipPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders and class leaders to view memberships
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Membership $membership): bool
    {
        // Department leaders and class leaders can only view memberships for users in their enrolled classes
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            return in_array($membership->user_id, $accessibleUserIds);
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
    public function update(User $user, Membership $membership): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Membership $membership): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Membership $membership): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Membership $membership): bool
    {
        return false;
    }
}
