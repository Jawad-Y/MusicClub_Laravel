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
     * Admin role is hidden - it should be invisible to all users
     */
    public function index(): JsonResponse
    {
        // Filter out admin role - it should never be visible
        $roles = Role::whereRaw('LOWER(role_name) != ?', ['admin'])
            ->orderBy('id', 'asc')
            ->get();

        return $this->success($roles);
    }

    /**
     * Store a newly created role in storage.
     * Prevent creating admin role
     */
    public function store(Request $request): JsonResponse
    {
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name'],
            'description' => ['nullable', 'string'],
        ]);
        
        // Prevent creating admin role
        if (strtolower($validated['role_name'] ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Cannot create Admin role.',
            ], 403);
        }

        $role = Role::create($validated);

        return $this->success($role, 'Role created successfully', 201);
    }

    /**
     * Display the specified role.
     * Prevent viewing admin role
     */
    public function show(Role $role): JsonResponse
    {
        // Block viewing admin role
        if (strtolower($role->role_name ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Role not found.',
            ], 404);
        }
        
        return $this->success($role);
    }

    /**
     * Update the specified role in storage.
     * Prevent editing admin role
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        // Prevent editing admin role
        if (strtolower($role->role_name ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Admin role cannot be modified.',
            ], 403);
        }
        
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name,' . $role->id],
            'description' => ['nullable', 'string'],
        ]);
        
        // Prevent changing any role to admin
        if (strtolower($validated['role_name'] ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Cannot rename role to Admin.',
            ], 403);
        }

        $role->update($validated);

        return $this->success($role, 'Role updated successfully');
    }

    /**
     * Remove the specified role from storage.
     * Prevent deleting admin role
     */
    public function destroy(Role $role): JsonResponse
    {
        // Prevent deleting admin role
        if (strtolower($role->role_name ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Admin role cannot be deleted.',
            ], 403);
        }
        
        $role->delete();

        return $this->success(null, 'Role deleted successfully', 204);
    }
}