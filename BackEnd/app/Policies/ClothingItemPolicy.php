<?php

namespace App\Policies;

use App\Models\ClothingItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ClothingItemPolicy
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

        // Allow department leaders and class leaders to view clothing items
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ClothingItem $clothingItem): bool
    {
        // Allow inventory managers full access
        if ($user->isInventoryManager()) {
            return true;
        }

        // Department leaders and class leaders can only view items assigned to their class members
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            
            // Check if the clothing item is assigned to any user in their classes
            $isAccessible = \App\Models\ClothingAssignment::where('item_id', $clothingItem->id)
                ->whereIn('user_id', $accessibleUserIds)
                ->whereNull('returned_at')
                ->exists();
            
            return $isAccessible;
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
    public function update(User $user, ClothingItem $clothingItem): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ClothingItem $clothingItem): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ClothingItem $clothingItem): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ClothingItem $clothingItem): bool
    {
        return false;
    }
}
