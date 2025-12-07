<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Department;
use Illuminate\Support\Facades\Log;

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
            } elseif (in_array($userRole, ['trainer', 'trainee'])) {
                // Trainers and trainees can only access departments of classes they are members of
                $hasAccess = $user->classMembers()
                    ->where('department_id', $departmentId)
                    ->exists();

                if (!$hasAccess) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access departments of classes you are enrolled in.',
                    ], 403);
                }
            } else {
                // Regular users are not allowed to access department resources
                return response()->json([
                    'status'  => false,
                    'message' => 'You do not have permission to access department resources.',
                ], 403);
            }
        } else {
            // For index/list requests (no specific department ID)
            // Department leaders should only see their own department
            if ($userRole === 'department leader') {
                // Store user ID in request for controller to filter
                $request->merge(['_department_leader_id' => $user->id]);
            } elseif (in_array($userRole, ['trainer', 'trainee'])) {
                // Trainers and trainees should only see departments of their enrolled classes
                $departmentIds = $user->classMembers()
                    ->pluck('department_id')
                    ->unique()
                    ->toArray();
                
                Log::info('Department Access Filter', [
                    'user_id' => $user->id,
                    'user_role' => $userRole,
                    'class_count' => $user->classMembers()->count(),
                    'department_ids' => $departmentIds
                ]);
                
                $request->merge(['_accessible_department_ids' => $departmentIds]);
            } elseif (!in_array($userRole, ['admin', 'leader'])) {
                // Regular users cannot list departments
                return response()->json([
                    'status'  => false,
                    'message' => 'You do not have permission to access department resources.',
                ], 403);
            }
        }

        return $next($request);
    }
}
