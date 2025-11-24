<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Handle user login and issue a Sanctum token.
     */
    public function login(Request $request)
    {
        try {
            // Validate incoming request data
            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            // Find user by email
            $user = User::where('email', $request->email)->first();

            // Verify user and password
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid credentials.',
                ], 401);
            }

            // Create a new token for this user
            $token = $user->createToken('api_token')->plainTextToken;

            return response()->json([
                'status'  => true,
                'message' => 'Login successful.',
                'token'   => $token,
                'user'    => $user,
            ]);
        } catch (\Throwable $e) {
            // TEMPORARY: return the error message to help debugging
            return response()->json([
                'status'  => false,
                'message' => 'Server error in login.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoke the current access token (logout).
     */
    public function logout(Request $request)
    {
        // Delete the current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Logout successful.',
        ]);
    }
}