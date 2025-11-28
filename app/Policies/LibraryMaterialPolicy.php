<?php

namespace App\Policies;

use App\Models\LibraryMaterial;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class LibraryMaterialPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow department leaders and class leaders to view library materials
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, LibraryMaterial $libraryMaterial): bool
    {
        // Allow department leaders and class leaders to view library materials
        if ($user->isDepartmentLeader() || $user->isClassLeader()) {
            return true;
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
    public function update(User $user, LibraryMaterial $libraryMaterial): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, LibraryMaterial $libraryMaterial): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, LibraryMaterial $libraryMaterial): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, LibraryMaterial $libraryMaterial): bool
    {
        return false;
    }
}
