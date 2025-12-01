<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\HomeworkSubmission;
use App\Models\PerformanceReview;

class CheckResourceOwnership
{
    /**
     * Handle incoming request and check resource ownership.
     *
     * This middleware ensures users can only edit/delete their own resources.
     * Used for homework submissions and performance reviews.
     *
     * - Students can only modify their own homework submissions
     * - Trainers/Class Leaders/Department Leaders can modify any submission in their scope
     * - Only the reviewer can delete their own performance reviews
     * - Admins and leaders bypass all checks
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            return response()->json([
                'status'  => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $user = $request->user();
        $userRole = strtolower($user->role->role_name ?? '');

        // Admins and leaders bypass ownership checks
        if (in_array($userRole, ['admin', 'leader'])) {
            return $next($request);
        }

        // Only check ownership on UPDATE and DELETE requests
        if (!in_array($request->method(), ['PUT', 'PATCH', 'DELETE'])) {
            return $next($request);
        }

        // Check ownership based on resource type
        $routeName = $request->route()->getName();
        
        // HOMEWORK SUBMISSIONS - students can only edit their own
        if (str_contains($routeName, 'homework-submissions')) {
            $submissionId = $request->route('homework_submission');
            
            if ($submissionId) {
                $submission = HomeworkSubmission::find($submissionId);
                
                if (!$submission) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Homework submission not found.',
                    ], 404);
                }

                // Students can only modify their own submissions
                if ($submission->student_id !== $user->id) {
                    // Trainers, class leaders, and department leaders can also modify
                    if (!in_array($userRole, ['trainer', 'class leader', 'department leader'])) {
                        return response()->json([
                            'status'  => false,
                            'message' => 'You can only modify your own homework submissions.',
                        ], 403);
                    }
                }
            }
        }

        // PERFORMANCE REVIEWS - only reviewer can delete
        if (str_contains($routeName, 'performance-reviews')) {
            $reviewId = $request->route('performance_review');
            
            if ($reviewId) {
                $review = PerformanceReview::find($reviewId);
                
                if (!$review) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Performance review not found.',
                    ], 404);
                }

                // Only the reviewer or authorized roles can delete/modify
                if ($review->reviewer_id !== $user->id) {
                    if (!in_array($userRole, ['trainer', 'department leader'])) {
                        return response()->json([
                            'status'  => false,
                            'message' => 'You can only modify reviews you created.',
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }
}