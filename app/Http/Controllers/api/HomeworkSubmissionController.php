<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeworkSubmission;
use Illuminate\Http\Request;

class HomeworkSubmissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
         // 1. get all submissions
return HomeworkSubmission::all();

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         // 1. validate input
$validated = $request->validate([
    'homework_id'  => 'required|exists:homework,id',
    'trainee_id'   => 'required|exists:users,id',
    'file_url'     => 'nullable|string|max:255',
    'notes'        => 'nullable|string',
    'submitted_at' => 'nullable|date',
]);

// 2. create submission
return HomeworkSubmission::create($validated);

    }

    /**
     * Display the specified resource.
     */
    public function show(HomeworkSubmission $homeworkSubmission)
    {
        return HomeworkSubmission::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HomeworkSubmission $homeworkSubmission)
    {
         // 1. find submission by id
$submission = HomeworkSubmission::findOrFail($id);

// 2. validate new data
$validated = $request->validate([
    'homework_id'  => 'sometimes|exists:homework,id',
    'trainee_id'   => 'sometimes|exists:users,id',
    'file_url'     => 'nullable|string|max:255',
    'notes'        => 'nullable|string',
    'submitted_at' => 'nullable|date',
]);

// 3. update submission
$submission->update($validated);

// 4. return updated submission
return $submission;

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HomeworkSubmission $homeworkSubmission)
    {
         // 1. find submission by id
$submission = HomeworkSubmission::findOrFail($id);

// 2. delete it
$submission->delete();

// 3. message
return response()->json(['message' => 'Submission deleted successfully']);

    }
}
