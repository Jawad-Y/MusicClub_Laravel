<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrainingSession;
use Illuminate\Http\Request;

class TrainingSessionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(TrainingSession::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

        return response()->json($session, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingSession $trainingSession)
    {
        return response()->json($trainingSession);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TrainingSession $trainingSession)
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

        return response()->json($trainingSession);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingSession $trainingSession)
    {
        $trainingSession->delete();

        return response()->json(['message' => 'Training Session deleted successfully'], 200);
    }
}
