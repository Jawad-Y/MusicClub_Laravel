<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\HomeworkSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeworkSubmissionController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $submissions = HomeworkSubmission::all();
        
        return $this->success($submissions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'homework_id'  => 'required|exists:homework,id',
            'trainee_id'   => 'required|exists:users,id',
            'file_url'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'submitted_at' => 'nullable|date',
        ]);

        $submission = HomeworkSubmission::create($validated);

        return $this->success($submission, 'Submission created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(HomeworkSubmission $homeworkSubmission): JsonResponse
    {
        return $this->success($homeworkSubmission);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HomeworkSubmission $homeworkSubmission): JsonResponse
    {
        $validated = $request->validate([
            'homework_id'  => 'sometimes|exists:homework,id',
            'trainee_id'   => 'sometimes|exists:users,id',
            'file_url'     => 'nullable|string|max:255',
            'notes'        => 'nullable|string',
            'submitted_at' => 'nullable|date',
        ]);

        $homeworkSubmission->update($validated);

        return $this->success($homeworkSubmission, 'Submission updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HomeworkSubmission $homeworkSubmission): JsonResponse
    {
        $homeworkSubmission->delete();

        return $this->success(null, 'Submission deleted successfully', 204);
    }
}
