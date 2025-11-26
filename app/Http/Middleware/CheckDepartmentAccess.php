<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Department;

class CheckDepartmentAccess
{
    /**
     * Handle incoming request and check department access.
     *
     * This middleware verifies if the authenticated user has access
     * to the requested department based on their role and assignments.
     *
     * Admins and leaders have access to all departments.
     * Department leaders can only access their own department.
     * Other users can only access departments they're members of.
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            return response()->json([
                'status'  => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $user = $request->user();
        $userRole = strtolower($user->role->role_name ?? '');

        // Admins and leaders have access to all departments
        if (in_array($userRole, ['admin', 'leader'])) {
            return $next($request);
        }

        // Get department ID from route parameter
        $departmentId = $request->route('department');
        
        // Handle route model binding - department might be a model instance
        if ($departmentId instanceof Department) {
            $departmentId = $departmentId->id;
        }

        if ($departmentId) {
            // Department leaders can only access their own department
            if ($userRole === 'department leader') {
                $isLeader = Department::where('id', $departmentId)
                    ->where('leader_id', $user->id)
                    ->exists();

                if (!$isLeader) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access your own department.',
                    ], 403);
                }
            } else {
                // Regular users are not allowed to access department resources
                return response()->json([
                    'status'  => false,
                    'message' => 'You do not have permission to access department resources.',
                ], 403);
            }
        }

        return $next($request);
    }
}
