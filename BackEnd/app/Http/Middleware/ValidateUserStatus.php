<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateUserStatus
{
    /**
     * Handle incoming request and validate user status.
     *
     * This middleware ensures that only active users can access the system.
     * Inactive, suspended, or deleted users will be denied access.
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip if user is not authenticated (login route, etc.)
        if (!$request->user()) {
            return $next($request);
        }

        $user = $request->user();

        // Check if user status is active
        if (strtolower($user->status) !== 'active') {
            // Revoke all tokens for inactive users
            $user->tokens()->delete();

            return response()->json([
                'success'  => false,
                'message' => 'Your account is not active. Please contact the administrator.',
            ], 403);
        }

        return $next($request);
    }
}
