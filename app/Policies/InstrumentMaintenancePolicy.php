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
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, InstrumentMaintenance $instrumentMaintenance): bool
    {
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
