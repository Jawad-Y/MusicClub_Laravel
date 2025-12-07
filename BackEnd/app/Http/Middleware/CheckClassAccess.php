<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Clas;
use App\Models\TrainingSession;

class CheckClassAccess
{
    /**
     * Handle incoming request and check class access.
     *
     * This middleware verifies if the authenticated user has access
     * to the requested class based on their role and assignments.
     *
     * Admins and leaders have access to all classes.
     * Department leaders can access classes in their department.
     * Class leaders and trainers can only access their assigned classes.
     * Members can only access classes they're enrolled in.
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

        // Admins and leaders have access to all classes
        if (in_array($userRole, ['admin', 'leader'])) {
            return $next($request);
        }

        // Individual Affair: read-only access to all classes (can view/list but cannot modify)
        if ($userRole === 'individual affair') {
            if ($request->isMethod('GET') || $request->isMethod('HEAD')) {
                return $next($request);
            }
            return response()->json([
                'status' => false,
                'message' => 'You do not have permission to modify class resources.',
            ], 403);
        }

        // Get class parameter from route (handle both 'myclasses' and 'class')
        $routeParam = $request->route('myclasses') ?? $request->route('class');

        if ($routeParam) {
            // Normalize route parameter into a Clas model instance
            if ($routeParam instanceof Clas) {
                $class = $routeParam;
            } elseif ($routeParam instanceof \Illuminate\Support\Collection) {
                $first = $routeParam->first();
                if ($first instanceof Clas) {
                    $class = $first;
                } elseif (is_object($first) && isset($first->id)) {
                    $class = Clas::find($first->id);
                } else {
                    $class = Clas::find($first);
                }
            } elseif (is_object($routeParam) && isset($routeParam->id)) {
                $class = Clas::find($routeParam->id);
            } elseif (is_array($routeParam)) {
                $id = $routeParam[0] ?? null;
                $class = $id ? Clas::find($id) : null;
            } else {
                // assume scalar id
                $class = Clas::find($routeParam);
            }

            if (!$class) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Class not found.',
                ], 404);
            }

            // Department leaders can access classes in their department
            if ($userRole === 'department leader') {
                $isLeader = $user->ledDepartments()
                    ->where('id', $class->department_id)
                    ->exists();

                if (!$isLeader) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access classes in your department.',
                    ], 403);
                }
            }
            // Class leaders can only access their assigned class
            elseif ($userRole === 'class leader') {
                if ($class->class_leader_id !== $user->id) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access your assigned class.',
                    ], 403);
                }
            }
            // Trainers can only access classes they teach
            elseif ($userRole === 'trainer') {
                $isTrainer = $user->classMembers()
                    ->where('classes.id', $class->id)
                    ->wherePivot('role', 'trainer')
                    ->exists();

                if (!$isTrainer) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access classes you teach.',
                    ], 403);
                }
            }
            // Regular members/trainees can only access classes they're enrolled in
            else {
                $isMember = $user->classMembers()
                    ->where('classes.id', $class->id)
                    ->exists();

                if (!$isMember) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You are not enrolled in this class.',
                    ], 403);
                }
            }
        } else {
            // For index/list requests (no specific class ID)
            // Store filter criteria based on user role
            if ($userRole === 'department leader') {
                // Get department IDs where user is leader
                $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
                $request->merge(['_filter_department_ids' => $departmentIds]);
            } elseif ($userRole === 'class leader') {
                // Only show their own class
                $request->merge(['_filter_class_leader_id' => $user->id]);
            } elseif ($userRole === 'trainer') {
                // Only show classes they teach
                $classIds = $user->classMembers()
                    ->wherePivot('role', 'trainer')
                    ->pluck('classes.id')
                    ->toArray();
                $request->merge(['_filter_class_ids' => $classIds]);
            } else {
                // Regular members/trainees can only see classes they're enrolled in
                $classIds = $user->classMembers()->pluck('classes.id')->toArray();
                $request->merge(['_filter_class_ids' => $classIds]);
            }
        }

        return $next($request);
    }
}
