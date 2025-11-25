<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\PerformanceReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceReviewController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $performanceReviews = PerformanceReview::with(['trainee', 'trainer', 'session'])->get();
        
        return $this->success($performanceReviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'trainee_id' => 'required|exists:users,id',
            'trainer_id' => 'required|exists:users,id',
            'session_id' => 'required|exists:training_sessions,id',
            'rating' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $performanceReview = PerformanceReview::create($validated);
        $performanceReview->load(['trainee', 'trainer', 'session']);

        return $this->success($performanceReview, 'Performance review created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PerformanceReview $performanceReview): JsonResponse
    {
        $performanceReview->load(['trainee', 'trainer', 'session']);
        
        return $this->success($performanceReview);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PerformanceReview $performanceReview): JsonResponse
    {
        $validated = $request->validate([
            'trainee_id' => 'sometimes|required|exists:users,id',
            'trainer_id' => 'sometimes|required|exists:users,id',
            'session_id' => 'sometimes|required|exists:training_sessions,id',
            'rating' => 'sometimes|required|integer|min:1|max:10',
            'notes' => 'nullable|string',
        ]);

        $performanceReview->update($validated);
        $performanceReview->load(['trainee', 'trainer', 'session']);

        return $this->success($performanceReview, 'Performance review updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PerformanceReview $performanceReview): JsonResponse
    {
        $performanceReview->delete();

        return $this->success(null, 'Performance review deleted successfully', 204);
    }
}
