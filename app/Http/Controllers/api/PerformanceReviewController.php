<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PerformanceReview;
use Illuminate\Http\Request;

class PerformanceReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $performanceReviews = PerformanceReview::with(['trainee', 'trainer', 'session'])->get();
        return response()->json($performanceReviews);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
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

        return response()->json($performanceReview, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PerformanceReview $performanceReview)
    {
        $performanceReview->load(['trainee', 'trainer', 'session']);
        return response()->json($performanceReview);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PerformanceReview $performanceReview)
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

        return response()->json($performanceReview);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PerformanceReview $performanceReview)
    {
        $performanceReview->delete();

        return response()->json(null, 204);
    }
}
