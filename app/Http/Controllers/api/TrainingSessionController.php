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
        // 1. get all sessions
        return TrainingSession::all();

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        
        // 1. validate input
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

// 2. create new session
return TrainingSession::create($validated);

    }

    /**
     * Display the specified resource.
     */
    public function show(TrainingSession $trainingSession)
    {
        return TrainingSession::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TrainingSession $trainingSession)
    {
        
        // 1. find session by id
$session = TrainingSession::findOrFail($id);

// 2. validate new data
$validated = $request->validate([
    'class_id'    => 'sometimes|exists:classes,id',
    'trainer_id'  => 'sometimes|exists:users,id',
    'subject'     => 'sometimes|string|max:200',
    'date'        => 'sometimes|date',
    'start_time'  => 'sometimes',
    'end_time'    => 'sometimes',
    'location'    => 'nullable|string|max:150',
    'description' => 'nullable|string',
]);

// 3. update session
$session->update($validated);

// 4. return updated session
return $session;

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TrainingSession $trainingSession)
    {
        
         // 1. find session by id
$session = TrainingSession::findOrFail($id);

// 2. delete session
$session->delete();

// 3. return success message
return response()->json(['message' => 'Session deleted successfully']);
    
    }
}
