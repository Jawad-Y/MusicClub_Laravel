<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Display a paginated list of users.
     */
    public function index(): JsonResponse
    {
        $users = User::with('role')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return $this->success($users);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
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

        $user->load('role');

        return $this->success($user, 'User created successfully', 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $user->load('role');

        return $this->success($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): JsonResponse
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
        $user->load('role');

        return $this->success($user, 'User updated successfully');
    }

    /**
     * Soft delete the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return $this->success(null, 'User deleted successfully', 204);
    }
}