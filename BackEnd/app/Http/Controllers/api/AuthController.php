<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Handle user login and issue a Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            // Validate incoming request data
            $validated = $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            // Find user by email
            $user = User::where('email', $validated['email'])->first();

            // Verify user and password
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return $this->error('Invalid credentials.', 401);
            }

            // Create a new token for this user
            $token = $user->createToken('api_token')->plainTextToken;

            return $this->success([
                'token' => $token,
                'user'  => $user,
            ], 'Login successful');
        } catch (\Throwable $e) {
            return $this->error('Server error in login.', 500, $e->getMessage());
        }
    }

    /**
     * Revoke the current access token (logout).
     */
    public function logout(Request $request): JsonResponse
    {
        // Delete the current access token
        $request->user()?->currentAccessToken()?->delete();

        return $this->success(null, 'Logout successful');
    }

    /**
     * Get the authenticated user's data.
     */
    public function me(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return $this->error('Unauthenticated.', 401);
            }

            // Load the user's role relationship
            $user->load('role');

            return $this->success($user, 'User data retrieved successfully');
        } catch (\Throwable $e) {
            return $this->error('Server error.', 500, $e->getMessage());
        }
    }
}