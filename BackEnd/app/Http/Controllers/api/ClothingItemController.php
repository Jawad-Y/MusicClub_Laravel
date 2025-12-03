<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\ClothingItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClothingItemController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100'
        ]);

        $limit = $request->input('limit', 20);
        $user = $request->user();
        $query = ClothingItem::query()->with(['assignments:id,item_id,user_id,assigned_at']);

        // Filter for department leaders and class leaders - only show items assigned to their class members
        // Inventory managers have full access
        if (($user->isDepartmentLeader() || $user->isClassLeader()) && !$user->isInventoryManager()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            $itemIds = \App\Models\ClothingAssignment::whereIn('user_id', $accessibleUserIds)
                ->whereNull('returned_at')
                ->pluck('item_id')
                ->unique();
            
            $query->whereIn('id', $itemIds);
        }

        $items = $query->orderBy('category')
            ->get(['id','category','size','quantity']);

        return $this->success($items);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $query = ClothingItem::query()->with(['assignments:id,item_id,user_id,assigned_at']);

        // Filter for department leaders and class leaders, but not for inventory managers
        if (($user->isDepartmentLeader() || $user->isClassLeader()) && !$user->isInventoryManager()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            $itemIds = \App\Models\ClothingAssignment::whereIn('user_id', $accessibleUserIds)
                ->whereNull('returned_at')
                ->pluck('item_id')
                ->unique();
            
            $query->whereIn('id', $itemIds);
        }

        $item = $query->findOrFail($id);

        return $this->success($item);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'size'     => 'required|string|max:50',
            'quantity' => 'required|integer|min:0',
        ]);

        $item = ClothingItem::create($validated);

        return $this->success($item, 'Clothing item created successfully', 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $item = ClothingItem::findOrFail($id);

        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'size'     => 'sometimes|string|max:50',
            'quantity' => 'sometimes|integer|min:0',
        ]);

        $item->update($validated);

        return $this->success($item, 'Clothing item updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $item = ClothingItem::findOrFail($id);
        $item->delete();

        return $this->success(null, 'Clothing item deleted successfully', 204);
    }
    public function listAssignments($itemId)
    {
        $item = ClothingItem::with(['assignments:user:id,name,email'])
            ->findOrFail($itemId);

        return response()->json([
            'message' => 'Assignments retrieved successfully',
            'data' => $item->assignments
        ]);
    }
}
