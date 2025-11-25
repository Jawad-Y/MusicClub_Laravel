<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\TrainingSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingSessionController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
<<<<<<< HEAD
        $sessions = TrainingSession::all();
        
        return $this->success($sessions);
=======
        return response()->json(TrainingSession::all());
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id'    => 'required|exists:classes,id',
            'trainer_id'  => 'required|exists:users,id',
            'subject'     => 'required|string|max:200',
            'date'        => 'required|date',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'location'    => 'nullable|string|max:150',
            'description' => 'nullable|string',
        ]);

        $session = TrainingSession::create($validated);

<<<<<<< HEAD
        return $this->success($session, 'Training session created successfully', 201);
=======
        return response()->json($session, 201);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingSession $trainingSession): JsonResponse
    {
<<<<<<< HEAD
        return $this->success($trainingSession);
=======
        return response()->json($trainingSession);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TrainingSession $trainingSession): JsonResponse
    {
        $validated = $request->validate([
            'class_id'   => 'sometimes|exists:classes,id',
            'trainer_id' => 'sometimes|exists:users,id',
            'subject'    => 'sometimes|string|max:200',
            'date'       => 'sometimes|date',
            'start_time' => 'sometimes',
            'end_time'   => 'sometimes',
            'location'   => 'nullable|string|max:150',
            'description'=> 'nullable|string',
        ]);

        $trainingSession->update($validated);

<<<<<<< HEAD
        return $this->success($trainingSession, 'Training session updated successfully');
=======
        return response()->json($trainingSession);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingSession $trainingSession): JsonResponse
    {
        $trainingSession->delete();

<<<<<<< HEAD
        return $this->success(null, 'Training session deleted successfully', 204);
=======
        return response()->json(['message' => 'Training Session deleted successfully'], 200);
>>>>>>> ef5ff7784d81a77e414fc55e52c51d666bfb4f99
    }
}
