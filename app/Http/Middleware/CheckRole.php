<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle incoming request and check allowed roles.
     *
     * This middleware verifies if the authenticated user
     * has any of the roles listed in the middleware parameters.
     *
     * Example usage:
     *  - middleware: role:leader
     *  - middleware: role:leader,individual affair
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Ensure user is authenticated
        if (!auth()->check()) {
            return response()->json([
                'status'  => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $user = auth()->user();

        // Extract user role name
        $userRole = strtolower($user->role->role_name ?? '');

        // Convert roles passed in middleware to lowercase
        $allowedRoles = array_map('strtolower', $roles);

        // Check if the user role is allowed to access the route
        if (!in_array($userRole, $allowedRoles)) {
            return response()->json([
                'status'  => false,
                'message' => 'You are not allowed to access this resource.',
            ], 403);
        }

        return $next($request);
    }
}