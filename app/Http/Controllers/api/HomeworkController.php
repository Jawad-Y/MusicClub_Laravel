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
    public function index(): JsonResponse
    {
<<<<<<< HEAD
        $homework = Homework::all();
        
        return $this->success($homework);
=======
        return response()->json(Homework::all());
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
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

<<<<<<< HEAD
        return $this->success($homework, 'Homework created successfully', 201);
=======
        return response()->json($homework, 201);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Display the specified resource.
     */
    public function show(Homework $homework): JsonResponse
    {
<<<<<<< HEAD
        return $this->success($homework);
=======
        return response()->json($homework);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
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

<<<<<<< HEAD
        return $this->success($homework, 'Homework updated successfully');
=======
        return response()->json($homework);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Homework $homework): JsonResponse
    {
        $homework->delete();

<<<<<<< HEAD
        return $this->success(null, 'Homework deleted successfully', 204);
=======
        return response()->json([
            'message' => 'Homework deleted successfully'
        ], 200);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }
}
