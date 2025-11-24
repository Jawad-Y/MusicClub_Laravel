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
         // 1. get all attendance records
return SessionAttendance::all();

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         // 1. validate input
$validated = $request->validate([
    'session_id'    => 'required|exists:training_sessions,id',
    'trainee_id'    => 'required|exists:users,id',
    'status'        => 'required|string|max:20',
    'confirmation'  => 'nullable|string|max:20',
]);

// 2. create attendance row
return SessionAttendance::create($validated);

    }

    /**
     * Display the specified resource.
     */
    public function show(SessionAttendance $sessionAttendance)
    {
        return SessionAttendance::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SessionAttendance $sessionAttendance)
    {
         // 1. find attendance by id
$attendance = SessionAttendance::findOrFail($id);

// 2. validate new data
$validated = $request->validate([
    'session_id'    => 'sometimes|exists:training_sessions,id',
    'trainee_id'    => 'sometimes|exists:users,id',
    'status'        => 'sometimes|string|max:20',
    'confirmation'  => 'sometimes|string|max:20',
]);

// 3. update attendance
$attendance->update($validated);

// 4. return updated row
return $attendance;

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SessionAttendance $sessionAttendance)
    {
        // 1. find attendance by id
$attendance = SessionAttendance::findOrFail($id);

// 2. delete it
$attendance->delete();

// 3. success message
return response()->json(['message' => 'Attendance deleted successfully']);

    }
}
