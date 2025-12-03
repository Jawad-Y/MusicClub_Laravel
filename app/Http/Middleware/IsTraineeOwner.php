<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\HomeworkSubmission;

class IsTraineeOwner
{
    /**
     * Handle an incoming request.
     * 
     * Ensures that trainees can only modify their own homework submissions.
     * Other roles are allowed to proceed.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Only apply this restriction to trainees
        if ($user->isTrainee()) {
            // For create operations, ensure trainee_id matches authenticated user
            if ($request->isMethod('post')) {
                $request->merge(['trainee_id' => $user->id]);
            }
            
            // For update/delete operations, verify ownership
            if (in_array($request->method(), ['PUT', 'PATCH', 'DELETE'])) {
                $submissionId = $request->route('homework_submission');
                
                if ($submissionId) {
                    $submission = HomeworkSubmission::find($submissionId);
                    
                    if (!$submission) {
                        return response()->json(['message' => 'Submission not found'], 404);
                    }
                    
                    if ($submission->trainee_id !== $user->id) {
                        return response()->json([
                            'message' => 'Unauthorized. You can only modify your own submissions.'
                        ], 403);
                    }
                }
            }
        }

        return $next($request);
    }
}
