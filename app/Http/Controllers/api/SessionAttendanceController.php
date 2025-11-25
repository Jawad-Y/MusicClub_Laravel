<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SessionAttendance;
use Illuminate\Http\Request;

class SessionAttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(SessionAttendance::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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
    public function show(SessionAttendance $sessionAttendance)
    {
        return response()->json($sessionAttendance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SessionAttendance $sessionAttendance)
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
    public function destroy(SessionAttendance $sessionAttendance)
    {
        $sessionAttendance->delete();

        return response()->json(['message' => 'Session Attendance deleted successfully'], 200);
    }
}
