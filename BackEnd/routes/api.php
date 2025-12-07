<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ClasController;
use App\Http\Controllers\Api\ClassMemberController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\InstrumentTypeController;
use App\Http\Controllers\Api\InstrumentController;
use App\Http\Controllers\Api\InstrumentAssignmentController;
use App\Http\Controllers\Api\InstrumentMaintenanceController;
use App\Http\Controllers\Api\ClothingItemController;
use App\Http\Controllers\Api\ClothingAssignmentController;
use App\Http\Controllers\Api\LibraryMaterialController;
use App\Http\Controllers\Api\TrainingSessionController;
use App\Http\Controllers\Api\SessionAttendanceController;
use App\Http\Controllers\Api\HomeworkController;
use App\Http\Controllers\Api\HomeworkSubmissionController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\EventParticipantController;
use App\Http\Controllers\Api\PerformanceReviewController;
use App\Http\Controllers\Api\UserAssignmentController;
use App\Http\Controllers\Api\ReportsLogController;

// Public authentication route
Route::post('login', [AuthController::class, 'login']);

// Protected API routes (require Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Logout route
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Get authenticated user
    Route::get('me', [AuthController::class, 'me']);

    // User routes
    Route::apiResource('users', UserController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');

    // Role routes
    Route::apiResource('roles', RoleController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader');

    // Department routes
    Route::apiResource('departments', DepartmentController::class)
        ->middleware('department.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader');

    // Class routes
    Route::apiResource('myclasses', ClasController::class)->parameters([
    'myclasses' => 'myclasses'
    ])
        ->middleware('class.access')
        ->middlewareFor(['store', 'destroy'], 'role:Admin,leader,department leader')
        ->middlewareFor(['update'], 'role:Admin,leader,department leader,class leader');

    // Class member routes
    Route::apiResource('classmembers', ClassMemberController::class)
        ->only(['index', 'show']) // Trainees can view
        ->middleware('class.access');
    
    Route::apiResource('classmembers', ClassMemberController::class)
        ->except(['index', 'show'])
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader');

    // Membership routes
    Route::apiResource('memberships', MembershipController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');

    // Instrument type routes
    Route::apiResource('instrument-types', InstrumentTypeController::class)
        ->middleware('role:Admin,leader,inventory manager');

    // Instrument routes
    Route::apiResource('instruments', InstrumentController::class)
        ->middleware('role:Admin,leader,inventory manager,department leader');

    // Instrument assignment routes
    Route::apiResource('instrument-assignments', InstrumentAssignmentController::class)
        ->middleware('role:Admin,leader,inventory manager,department leader');

    // Instrument maintenance routes
    Route::apiResource('instrument-maintenances', InstrumentMaintenanceController::class)
        ->middleware('role:Admin,leader,inventory manager,department leader,class leader');

    // Clothing item routes
    Route::apiResource('clothing-items', ClothingItemController::class)
        ->middleware('role:Admin,leader,inventory manager,department leader,class leader');

    // Clothing assignment routes
    Route::apiResource('clothing-assignments', ClothingAssignmentController::class)
        ->middleware('role:Admin,leader,inventory manager,department leader,class leader');

    // Library material routes
    Route::apiResource('library-materials', LibraryMaterialController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager')
        ->middlewareFor(['store', 'update'], 'role:trainer');

    // Training session routes - Trainees can view sessions for their classes
    Route::apiResource('training-sessions', TrainingSessionController::class)
        ->only(['index', 'show']); // All authenticated users including trainees
    
    Route::apiResource('training-sessions', TrainingSessionController::class)
        ->except(['index', 'show'])
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

    // Session attendance routes - Trainees can view their own attendance
    Route::apiResource('session-attendances', SessionAttendanceController::class)
        ->only(['index', 'show']); // All authenticated users including trainees
    
    Route::apiResource('session-attendances', SessionAttendanceController::class)
        ->except(['index', 'show'])
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

    // Homework routes - Trainees can view homework for their classes
    Route::apiResource('homeworks', HomeworkController::class)
        ->only(['index', 'show']); // All authenticated users including trainees
    
    Route::apiResource('homeworks', HomeworkController::class)
        ->except(['index', 'show'])
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

    // Homework submission routes - Trainees can create/update/delete their own submissions
    Route::apiResource('homework-submissions', HomeworkSubmissionController::class)
        ->only(['index', 'show']); // All can view (filtered by scope)
    
    Route::apiResource('homework-submissions', HomeworkSubmissionController::class)
        ->except(['index', 'show'])
        ->middleware('trainee.owner') // Ensures trainees only modify their own
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer,trainee');

    // Event routes
    Route::apiResource('events', EventController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');

    // Event participant routes
    Route::apiResource('event-participants', EventParticipantController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,individual affair');

    // Performance review routes
    Route::apiResource('performance-reviews', PerformanceReviewController::class)
        ->middleware('resource.owner')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,trainer');

    // User assignment routes
    Route::apiResource('user-assignments', UserAssignmentController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');

    // Reports log routes
    Route::apiResource('reports-logs', ReportsLogController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');
});
