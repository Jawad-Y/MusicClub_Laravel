<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use Illuminate\Http\Request;

class HomeworkController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         // 1. get all homework
return Homework::all();

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         // 1. validate input
$validated = $request->validate([
    'session_id'    => 'required|exists:training_sessions,id',
    'assign_scope'  => 'required|string|max:20',
    'description'   => 'required|string',
    'due_date'      => 'nullable|date',
]);

// 2. create homework
return Homework::create($validated);

    }

    /**
     * Display the specified resource.
     */
    public function show(Homework $homework)
    {
        return Homework::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Homework $homework)
    {
         // 1. find homework by id
$homework = Homework::findOrFail($id);

// 2. validate new data
$validated = $request->validate([
    'session_id'    => 'sometimes|exists:training_sessions,id',
    'assign_scope'  => 'sometimes|string|max:20',
    'description'   => 'sometimes|string',
    'due_date'      => 'nullable|date',
]);

// 3. update homework
$homework->update($validated);

// 4. return updated homework
return $homework;

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Homework $homework)
    {
         // 1. find homework by id
$homework = Homework::findOrFail($id);

// 2. delete it
$homework->delete();

// 3. message
return response()->json(['message' => 'Homework deleted successfully']);

    }
}
