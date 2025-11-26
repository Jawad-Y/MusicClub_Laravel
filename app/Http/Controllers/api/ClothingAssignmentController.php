<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\ClothingAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClothingAssignmentController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $assignments = ClothingAssignment::with(['item', 'user'])->get();
        
        return $this->success($assignments);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $assignment = ClothingAssignment::with(['item', 'user'])->findOrFail($id);
        
        return $this->success($assignment);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_id'     => 'required|integer|exists:clothing_items,id',
            'user_id'     => 'required|integer|exists:users,id',
            'assigned_at' => 'required|date',
            'returned_at' => 'nullable|date|after:assigned_at',
        ]);

        $assignment = ClothingAssignment::create($validated);
        $assignment->load(['item', 'user']);

        return $this->success($assignment, 'Clothing assigned successfully', 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $assignment = ClothingAssignment::findOrFail($id);

        $validated = $request->validate([
            'item_id'     => 'sometimes|integer|exists:clothing_items,id',
            'user_id'     => 'sometimes|integer|exists:users,id',
            'assigned_at' => 'sometimes|date',
            'returned_at' => 'nullable|date|after:assigned_at',
        ]);

        $assignment->update($validated);
        $assignment->load(['item', 'user']);

        return $this->success($assignment, 'Assignment updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $assignment = ClothingAssignment::findOrFail($id);
        $assignment->delete();

        return $this->success(null, 'Assignment deleted successfully', 204);
    }
    public function listByUser($userId)
    {
        $assignments = ClothingAssignment::with('item')
            ->where('user_id', $userId)
            ->get();

        return response()->json($assignments);
    }
    public function listByItem($itemId)
    {
        $assignments = ClothingAssignment::with('user')
            ->where('item_id', $itemId)
            ->get();

        return response()->json($assignments);
    }
}
