<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\SessionAttendance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionAttendanceController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(SessionAttendance::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'    => 'required|exists:training_sessions,id',
            'trainee_id'    => 'required|exists:users,id',
            'status'        => 'required|string',
            'confirmation'  => 'nullable|string',
        ]);

        $attendance = SessionAttendance::create($validated);

        return response()->json($attendance, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SessionAttendance $sessionAttendance): JsonResponse
    {
        return response()->json($sessionAttendance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SessionAttendance $sessionAttendance): JsonResponse
    {
        $validated = $request->validate([
            'session_id'    => 'sometimes|exists:training_sessions,id',
            'trainee_id'    => 'sometimes|exists:users,id',
            'status'        => 'sometimes|string',
            'confirmation'  => 'sometimes|string',
        ]);

        $sessionAttendance->update($validated);

        return response()->json($sessionAttendance);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SessionAttendance $sessionAttendance): JsonResponse
    {
        $sessionAttendance->delete();

        return response()->json(['message' => 'Session Attendance deleted successfully'], 200);
    }
}
