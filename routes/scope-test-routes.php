<?php

/*
|--------------------------------------------------------------------------
| Role-Based Scope Testing Routes
|--------------------------------------------------------------------------
|
| These routes demonstrate the role-based access control implementation.
| Add these to your routes/api.php file to test the scopes.
|
| Usage:
| 1. Authenticate as different users with different roles
| 2. Call these endpoints to see how data is filtered based on role
|
*/

use App\Http\Controllers\Examples\RoleScopedController;

Route::middleware('auth:sanctum')->prefix('scope-test')->group(function () {
    
    // Get information about current user's role and access
    Route::get('/my-role-info', [RoleScopedController::class, 'getUserRoleInfo'])
        ->name('scope.role-info');
    
    // Get users accessible to current user
    Route::get('/accessible-users', [RoleScopedController::class, 'getAccessibleUsers'])
        ->name('scope.users');
    
    // Get classes accessible to current user
    Route::get('/accessible-classes', [RoleScopedController::class, 'getAccessibleClasses'])
        ->name('scope.classes');
    
    // Get departments accessible to current user
    Route::get('/accessible-departments', [RoleScopedController::class, 'getAccessibleDepartments'])
        ->name('scope.departments');
    
    // Get members of a specific class (only if user has access)
    Route::get('/class/{classId}/members', [RoleScopedController::class, 'getClassMembers'])
        ->name('scope.class-members');
});

/*
|--------------------------------------------------------------------------
| Testing Guide
|--------------------------------------------------------------------------
|
| Test as Leader (sees everything):
|   GET /api/scope-test/accessible-users
|   GET /api/scope-test/accessible-classes
|   GET /api/scope-test/accessible-departments
|
| Test as Department Leader:
|   GET /api/scope-test/my-role-info
|   → Should show department IDs they lead
|   
|   GET /api/scope-test/accessible-classes
|   → Should show only classes in their departments
|
| Test as Class Leader:
|   GET /api/scope-test/accessible-classes
|   → Should show only their classes
|   
|   GET /api/scope-test/class/{classId}/members
|   → Should work for their classes, 404 for others
|
| Test as Trainee:
|   GET /api/scope-test/accessible-users
|   → Should show only classmates
|   
|   GET /api/scope-test/accessible-classes
|   → Should show only classes they're enrolled in
|
*/
