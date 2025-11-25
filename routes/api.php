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
        ->middlewareFor(['store', 'update', 'destroy'], 'role:leader,individual affair');

    // Role routes
    Route::apiResource('roles', RoleController::class);

    // Department routes
    Route::apiResource('departments', DepartmentController::class);

    // Class routes
    Route::apiResource('myclasses', ClasController::class)->parameters([
    'myclasses' => 'myclasses'
    ]);

    // Class member routes
    Route::apiResource('class-members', ClassMemberController::class);

    // Membership routes
    Route::apiResource('memberships', MembershipController::class);

    // Instrument type routes
    Route::apiResource('instrument-types', InstrumentTypeController::class);

    // Instrument routes
    Route::apiResource('instruments', InstrumentController::class);

    // Instrument assignment routes
    Route::apiResource('instrument-assignments', InstrumentAssignmentController::class);

    // Instrument maintenance routes
    Route::apiResource('instrument-maintenances', InstrumentMaintenanceController::class);

    // Clothing item routes
    Route::apiResource('clothing-items', ClothingItemController::class);

    // Clothing assignment routes
    Route::apiResource('clothing-assignments', ClothingAssignmentController::class);

    // Library material routes
    Route::apiResource('library-materials', LibraryMaterialController::class);

    // Training session routes
    Route::apiResource('training-sessions', TrainingSessionController::class);

    // Session attendance routes
    Route::apiResource('session-attendances', SessionAttendanceController::class);

    // Homework routes
    Route::apiResource('homeworks', HomeworkController::class);

    // Homework submission routes
    Route::apiResource('homework-submissions', HomeworkSubmissionController::class);

    // Event routes
    Route::apiResource('events', EventController::class);

    // Event participant routes
    Route::apiResource('event-participants', EventParticipantController::class);

    // Performance review routes
    Route::apiResource('performance-reviews', PerformanceReviewController::class);

    // User assignment routes
    Route::apiResource('user-assignments', UserAssignmentController::class);

    // Reports log routes
    Route::apiResource('reports-logs', ReportsLogController::class);
});
