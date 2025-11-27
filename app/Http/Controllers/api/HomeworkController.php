<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Homework;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeworkController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $homework = Homework::accessibleBy($user)
            ->with(['trainingSession.class', 'homeworkSubmissions'])
            ->get();
        
        return response()->json($homework);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id'   => 'required|exists:training_sessions,id',
            'assign_scope' => 'required|string|max:20',
            'description'  => 'required|string',
            'due_date'     => 'nullable|date',
        ]);

        $homework = Homework::create($validated);

        return response()->json($homework, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $homework = Homework::accessibleBy($user)
            ->with(['trainingSession.class', 'homeworkSubmissions.trainee'])
            ->findOrFail($id);
        
        return response()->json($homework);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Homework $homework): JsonResponse
    {
        $validated = $request->validate([
            'session_id'   => 'sometimes|exists:training_sessions,id',
            'assign_scope' => 'sometimes|string|max:20',
            'description'  => 'sometimes|string',
            'due_date'     => 'nullable|date',
        ]);

        $homework->update($validated);

        return response()->json($homework);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Homework $homework): JsonResponse
    {
        $homework->delete();

        return response()->json([
            'message' => 'Homework deleted successfully'
        ], 200);
    }
}
