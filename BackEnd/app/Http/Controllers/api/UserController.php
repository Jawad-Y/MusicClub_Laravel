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
     * Display a list of users.
     * Admins are completely hidden from all users (including other admins in the API)
     */
    public function index(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        
        // Filter out admin users - they are invisible to everyone
        $users = User::accessibleBy($currentUser)
            ->with('role')
            ->orderBy('id', 'desc')
            ->get();

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

        // Check role-based restrictions for user creation
        $currentUser = $request->user();
        $currentUserRole = strtolower($currentUser->role->role_name ?? '');
        $targetRole = Role::find($validated['role_id']);
        $targetRoleName = strtolower($targetRole->role_name ?? '');
        
        // CRITICAL: Nobody can create admin users - admins are completely invisible
        if ($targetRoleName === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Admin role cannot be assigned.',
            ], 403);
        }
        
        // Only Admin and Leader can create users with Leader role
        if ($targetRoleName === 'leader' && !in_array($currentUserRole, ['admin', 'leader'])) {
            return response()->json([
                'status' => false,
                'message' => 'Only Admin and Leader can create users with Leader role.',
            ], 403);
        }
        
        // Only Admin, Leader and Individual Affair can create Department Leader
        if ($targetRoleName === 'department leader' && !in_array($currentUserRole, ['admin', 'leader', 'individual affair'])) {
            return response()->json([
                'status' => false,
                'message' => 'Only Admin, Leader and Individual Affair can create users with Department Leader role.',
            ], 403);
        }

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
     * Prevent viewing admin users - they are invisible
     */
    public function show(User $user): JsonResponse
    {
        $user->load('role');
        
        // Block viewing admin users
        if (strtolower($user->role->role_name ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 404);
        }

        return $this->success($user);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        $currentUserRole = strtolower($currentUser->role->role_name ?? '');
        $isUpdatingSelf = $currentUser->id === $user->id;
        
        // CRITICAL: Prevent editing admin users - they are invisible and untouchable
        $existingUserRole = strtolower($user->role->role_name ?? '');
        if ($existingUserRole === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 404);
        }
        
        // Check if user has permission to edit this profile
        $canEditOthers = in_array($currentUserRole, ['admin', 'leader', 'individual affair']);
        
        if (!$isUpdatingSelf && !$canEditOthers) {
            return response()->json([
                'status' => false,
                'message' => 'You can only update your own profile.',
            ], 403);
        }

        // Different validation rules based on who is updating
        if ($isUpdatingSelf && !$canEditOthers) {
            // Regular users can only update their own basic info (no role/status changes)
            $validated = $request->validate([
                'full_name' => ['required', 'string', 'max:100'],
                'email'     => ['required', 'email', 'max:150', 'unique:users,email,' . $user->id],
                'phone'     => ['nullable', 'string', 'max:30'],
                'password'  => ['nullable', 'string', 'min:6'],
            ]);
            
            $user->full_name = $validated['full_name'];
            $user->email     = $validated['email'];
            $user->phone     = $validated['phone'] ?? null;
            
            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
        } elseif ($isUpdatingSelf && $canEditOthers) {
            // Leader or Individual Affair updating their OWN profile (basic info only, no role/status change)
            $validated = $request->validate([
                'full_name' => ['required', 'string', 'max:100'],
                'email'     => ['required', 'email', 'max:150', 'unique:users,email,' . $user->id],
                'phone'     => ['nullable', 'string', 'max:30'],
                'password'  => ['nullable', 'string', 'min:6'],
            ]);
            
            $user->full_name = $validated['full_name'];
            $user->email     = $validated['email'];
            $user->phone     = $validated['phone'] ?? null;
            
            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
        } else {
            // Leader or Individual Affair updating OTHER users
            $validated = $request->validate([
                'full_name' => ['required', 'string', 'max:100'],
                'email'     => ['required', 'email', 'max:150', 'unique:users,email,' . $user->id],
                'phone'     => ['nullable', 'string', 'max:30'],
                'role_id'   => ['required', 'exists:roles,id'],
                'status'    => ['required', 'in:active,inactive'],
                'password'  => ['nullable', 'string', 'min:6'],
            ]);

            // Check role-based restrictions for user updates
            $targetRole = Role::find($validated['role_id']);
            $targetRoleName = strtolower($targetRole->role_name ?? '');
            
            // CRITICAL: Nobody can assign admin role - admins are invisible
            if ($targetRoleName === 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Admin role cannot be assigned.',
                ], 403);
            }
            
            // Only Admin and Leader can assign Leader role
            if ($targetRoleName === 'leader' && !in_array($currentUserRole, ['admin', 'leader'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only Admin and Leader can assign Leader role.',
                ], 403);
            }
            
            // Only Admin, Leader and Individual Affair can assign Department Leader role
            if ($targetRoleName === 'department leader' && !in_array($currentUserRole, ['admin', 'leader', 'individual affair'])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Only Admin, Leader and Individual Affair can assign Department Leader role.',
                ], 403);
            }

            $user->full_name = $validated['full_name'];
            $user->email     = $validated['email'];
            $user->phone     = $validated['phone'] ?? null;
            $user->role_id   = $validated['role_id'];
            $user->status    = $validated['status'];

            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }
        }

        $user->save();
        $user->load('role');

        return $this->success($user, 'User updated successfully');
    }

    /**
     * Soft delete the specified user.
     * Prevent deleting admin users - they are invisible
     */
    public function destroy(User $user): JsonResponse
    {
        // CRITICAL: Prevent deleting admin users
        if (strtolower($user->role->role_name ?? '') === 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'User not found.',
            ], 404);
        }
        
        $user->delete();

        return $this->success(null, 'User deleted successfully', 204);
    }
}