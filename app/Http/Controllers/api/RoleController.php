<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Display a list of all roles.
     */
    public function index()
    {
        $roles = Role::orderBy('id', 'asc')->get();

        return response()->json([
            'status' => true,
            'data'   => $roles,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function store(Request $request)
    {
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name'],
            'description' => ['nullable', 'string'],
        ]);

        $role = Role::create($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Role created successfully.',
            'data'    => $role,
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role)
    {
        return response()->json([
            'status' => true,
            'data'   => $role,
        ]);
    }

    /**
     * Update the specified role in storage.
     */
    public function update(Request $request, Role $role)
    {
        // Validate input data
        $validated = $request->validate([
            'role_name'   => ['required', 'string', 'max:50', 'unique:roles,role_name,' . $role->id],
            'description' => ['nullable', 'string'],
        ]);

        $role->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Role updated successfully.',
            'data'    => $role,
        ]);
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role)
    {
        $role->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Role deleted successfully.',
        ]);
    }
}