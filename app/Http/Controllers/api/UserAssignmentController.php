<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAssignment;
use Illuminate\Http\Request;

class UserAssignmentController extends Controller
{
    /**
     * Display a list of all user assignments.
     */
    public function index()
    {
        // Eager-load relationships if they are defined in the model
        $assignments = UserAssignment::with(['user', 'class', 'department', 'instrument'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $assignments,
        ]);
    }

    /**
     * Store a newly created user assignment in storage.
     */
    public function store(Request $request)
    {
        // Validate input data
        $validated = $request->validate([
            'user_id'       => ['required', 'integer', 'exists:users,id'],
            'class_id'      => ['nullable', 'integer', 'exists:classes,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'instrument_id' => ['nullable', 'integer', 'exists:instruments,id'],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $assignment = UserAssignment::create([
            'user_id'       => $validated['user_id'],
            'class_id'      => $validated['class_id'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'instrument_id' => $validated['instrument_id'] ?? null,
            'start_date'    => $validated['start_date'],
            'end_date'      => $validated['end_date'] ?? null,
        ]);

        $assignment->load(['user', 'class', 'department', 'instrument']);

        return response()->json([
            'status'  => true,
            'message' => 'User assignment created successfully.',
            'data'    => $assignment,
        ], 201);
    }

    /**
     * Display the specified user assignment.
     */
    public function show(UserAssignment $userAssignment)
    {
        $userAssignment->load(['user', 'class', 'department', 'instrument']);

        return response()->json([
            'status' => true,
            'data'   => $userAssignment,
        ]);
    }

    /**
     * Update the specified user assignment in storage.
     */
    public function update(Request $request, UserAssignment $userAssignment)
    {
        // Validate input data
        $validated = $request->validate([
            'user_id'       => ['required', 'integer', 'exists:users,id'],
            'class_id'      => ['nullable', 'integer', 'exists:classes,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'instrument_id' => ['nullable', 'integer', 'exists:instruments,id'],
            'start_date'    => ['required', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $userAssignment->user_id       = $validated['user_id'];
        $userAssignment->class_id      = $validated['class_id'] ?? null;
        $userAssignment->department_id = $validated['department_id'] ?? null;
        $userAssignment->instrument_id = $validated['instrument_id'] ?? null;
        $userAssignment->start_date    = $validated['start_date'];
        $userAssignment->end_date      = $validated['end_date'] ?? null;
        $userAssignment->save();

        $userAssignment->load(['user', 'class', 'department', 'instrument']);

        return response()->json([
            'status'  => true,
            'message' => 'User assignment updated successfully.',
            'data'    => $userAssignment,
        ]);
    }

    /**
     * Remove the specified user assignment from storage.
     */
    public function destroy(UserAssignment $userAssignment)
    {
        $userAssignment->delete();

        return response()->json([
            'status'  => true,
            'message' => 'User assignment deleted successfully.',
        ]);
    }
}
