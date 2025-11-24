<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a paginated list of users.
     */
    public function index()
    {
        $users = User::with('role')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json([
            'status' => true,
            'data'   => $users,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone'     => ['nullable', 'string', 'max:30'],
            'role_id'   => ['required', 'exists:roles,id'],
            'status'    => ['required', 'in:active,inactive'],
            'password'  => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'] ?? null,
            'role_id'   => $validated['role_id'],
            'status'    => $validated['status'],
            'password'  => Hash::make($validated['password']),
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'User created successfully.',
            'data'    => $user->load('role'),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load('role');

        return response()->json([
            'status' => true,
            'data'   => $user,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        // Validate incoming data
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'max:150', 'unique:users,email,' . $user->id],
            'phone'     => ['nullable', 'string', 'max:30'],
            'role_id'   => ['required', 'exists:roles,id'],
            'status'    => ['required', 'in:active,inactive'],
            'password'  => ['nullable', 'string', 'min:6'],
        ]);

        $user->full_name = $validated['full_name'];
        $user->email     = $validated['email'];
        $user->phone     = $validated['phone'] ?? null;
        $user->role_id   = $validated['role_id'];
        $user->status    = $validated['status'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'status'  => true,
            'message' => 'User updated successfully.',
            'data'    => $user->load('role'),
        ]);
    }

    /**
     * Soft delete the specified user.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'status'  => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}