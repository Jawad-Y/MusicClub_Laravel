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
        return HomeworkSubmission::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'homework_id'  => 'required|exists:homework,id',
            'trainee_id'   => 'required|exists:users,id',
            'file_url'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'submitted_at' => 'nullable|date',
        ]);

        $submission = HomeworkSubmission::create($validated);

        return $submission;
    }

    /**
     * Display the specified resource.
     */
    public function show(HomeworkSubmission $homeworkSubmission)
    {
        return $homeworkSubmission;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HomeworkSubmission $homeworkSubmission)
    {
        $validated = $request->validate([
            'homework_id'  => 'sometimes|exists:homework,id',
            'trainee_id'   => 'sometimes|exists:users,id',
            'file_url'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'submitted_at' => 'nullable|date',
        ]);

        $homeworkSubmission->update($validated);

        return $homeworkSubmission;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HomeworkSubmission $homeworkSubmission)
    {
        $homeworkSubmission->delete();

        return response()->json(['message' => 'Submission deleted successfully']);
    }
}
