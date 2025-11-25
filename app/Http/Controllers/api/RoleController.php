<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    use ApiResponse;

    /**
     * Display a list of all roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::orderBy('id', 'asc')->get();

        return $this->success($roles);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name'],
            'description' => ['nullable', 'string'],
        ]);

        $role = Role::create($validated);

        return $this->success($role, 'Role created successfully', 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        return $this->success($role);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name,' . $role->id],
            'description' => ['nullable', 'string'],
        ]);

        $role->update($validated);

        return $this->success($role, 'Role updated successfully');
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): JsonResponse
    {
        $role->delete();

        return $this->success(null, 'Role deleted successfully', 204);
    }
}