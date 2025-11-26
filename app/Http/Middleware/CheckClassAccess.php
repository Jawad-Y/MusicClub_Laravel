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

        // Get class ID from route parameter (handle both 'myclasses' and 'class')
        $classId = $request->route('myclasses') ?? $request->route('class');

        if ($classId) {
            $class = Clas::find($classId);

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
                $isTrainer = TrainingSession::where('class_id', $classId)
                    ->where('trainer_id', $user->id)
                    ->exists();

                if (!$isTrainer) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You can only access classes you teach.',
                    ], 403);
                }
            }
            // Regular members can only access classes they're enrolled in
            else {
                $isMember = $user->memberships()
                    ->where('class_id', $classId)
                    ->exists();

                if (!$isMember) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'You are not enrolled in this class.',
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
