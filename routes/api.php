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
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader');

    // Class member routes
    Route::apiResource('class-members', ClassMemberController::class)
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader');

    // Membership routes
    Route::apiResource('memberships', MembershipController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,individual affair');

    // Instrument type routes
    Route::apiResource('instrument-types', InstrumentTypeController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Instrument routes
    Route::apiResource('instruments', InstrumentController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Instrument assignment routes
    Route::apiResource('instrument-assignments', InstrumentAssignmentController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Instrument maintenance routes
    Route::apiResource('instrument-maintenances', InstrumentMaintenanceController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Clothing item routes
    Route::apiResource('clothing-items', ClothingItemController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Clothing assignment routes
    Route::apiResource('clothing-assignments', ClothingAssignmentController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager');

    // Library material routes
    Route::apiResource('library-materials', LibraryMaterialController::class)
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,inventory manager')
        ->middlewareFor(['store', 'update'], 'role:trainer');

    // Training session routes
    Route::apiResource('training-sessions', TrainingSessionController::class)
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader ,trainer');

    // Session attendance routes
    Route::apiResource('session-attendances', SessionAttendanceController::class)
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

    // Homework routes
    Route::apiResource('homeworks', HomeworkController::class)
        ->middleware('class.access')
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

    // Homework submission routes
    Route::apiResource('homework-submissions', HomeworkSubmissionController::class)
        ->middleware(['class.access', 'resource.owner'])
        ->middlewareFor(['store', 'update', 'destroy'], 'role:Admin,leader,department leader,class leader,trainer');

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
