<?php

namespace App\Policies;

use App\Models\InstrumentMaintenance;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class InstrumentMaintenancePolicy
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

        // Allow department leaders and class leaders to view instrument maintenances
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
        // Allow inventory managers full access
        if ($user->isInventoryManager()) {
            return true;
        }

        // Department leaders and class leaders can only view maintenances for instruments assigned to their class members
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            
            // Check if the instrument is assigned to any user in their classes
            $isAccessible = \App\Models\InstrumentAssignment::where('instrument_id', $instrumentMaintenance->instrument_id)
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
    public function update(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
        return false;
    }
}
