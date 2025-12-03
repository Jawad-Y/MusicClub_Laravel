<?php

namespace App\Http\Controllers\Examples;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Clas;
use App\Models\Department;
use Illuminate\Http\Request;

/**
 * Example controller demonstrating role-based scopes
 * 
 * This shows how to use the accessibleBy scope to filter data
 * based on the authenticated user's role and permissions.
 */
class RoleScopedController extends Controller
{
    /**
     * Get users accessible to the authenticated user
     * 
     * - Leaders: See all users
     * - Department Leaders: See users in their department's classes
     * - Class Leaders: See users in their classes
     * - Trainees: See users in their own classes
     */
    public function getAccessibleUsers(Request $request)
    {
        $user = $request->user();
        
        $users = User::accessibleBy($user)->get();
        
        return response()->json([
            'users' => $users,
            'total' => $users->count(),
            'role' => $user->role->role_name ?? 'Unknown',
        ]);
    }

    /**
     * Get classes accessible to the authenticated user
     * 
     * - Leaders: See all classes
     * - Department Leaders: See classes in their departments
     * - Class Leaders: See their own classes
     * - Trainees/Trainers: See classes they are members of
     */
    public function getAccessibleClasses(Request $request)
    {
        $user = $request->user();
        
        $classes = Clas::accessibleBy($user)
            ->with(['department', 'classLeader', 'members'])
            ->get();
        
        return response()->json([
            'classes' => $classes,
            'total' => $classes->count(),
            'role' => $user->role->role_name ?? 'Unknown',
        ]);
    }

    /**
     * Get departments accessible to the authenticated user
     * 
     * - Leaders: See all departments
     * - Department Leaders: See their own departments
     * - Class Leaders: See departments through their classes
     */
    public function getAccessibleDepartments(Request $request)
    {
        $user = $request->user();
        
        $departments = Department::accessibleBy($user)
            ->with(['leader', 'classes'])
            ->get();
        
        return response()->json([
            'departments' => $departments,
            'total' => $departments->count(),
            'role' => $user->role->role_name ?? 'Unknown',
        ]);
    }

    /**
     * Get class members for a specific class
     * Only returns data if user has access to the class
     */
    public function getClassMembers(Request $request, $classId)
    {
        $user = $request->user();
        
        // Check if user can access this class
        $class = Clas::accessibleBy($user)->findOrFail($classId);
        
        // Get all members in the class
        $members = User::accessibleBy($user)
            ->whereHas('classMembers', function ($query) use ($classId) {
                $query->where('classes.id', $classId);
            })
            ->with(['role', 'classMembers' => function ($query) use ($classId) {
                $query->where('classes.id', $classId);
            }])
            ->get();
        
        return response()->json([
            'class' => $class,
            'members' => $members,
            'total' => $members->count(),
            'user_role' => $user->role->role_name ?? 'Unknown',
        ]);
    }

    /**
     * Get user's role information and accessible IDs
     */
    public function getUserRoleInfo(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'role' => $user->role->role_name ?? 'Unknown',
            'is_leader' => $user->isLeader(),
            'is_department_leader' => $user->isDepartmentLeader(),
            'is_class_leader' => $user->isClassLeader(),
            'is_trainer' => $user->isTrainer(),
            'is_trainee' => $user->isTrainee(),
            'accessible_department_ids' => $user->getAccessibleDepartmentIds(),
            'accessible_class_ids' => $user->getAccessibleClassIds(),
            'accessible_user_ids_count' => count($user->getAccessibleUserIds()),
        ]);
    }
}
