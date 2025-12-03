<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Clas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClasController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Clas::with(['department', 'classLeader']);
        
        // Apply filters based on user role from middleware
        if ($request->has('_filter_department_ids')) {
            // Department leaders: classes in their departments
            $query->whereIn('department_id', $request->input('_filter_department_ids'));
        } elseif ($request->has('_filter_class_leader_id')) {
            // Class leaders: only their class
            $query->where('class_leader_id', $request->input('_filter_class_leader_id'));
        } elseif ($request->has('_filter_class_ids')) {
            // Trainers and members: only their classes
            $query->whereIn('id', $request->input('_filter_class_ids'));
        }
        
        $myclasses = $query->get();
        
        return $this->success($myclasses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'class_leader_id' => 'nullable|exists:users,id',
        ]);

        $myclasses = Clas::create($validated);
        $myclasses->load(['department', 'classLeader']);

        return $this->success($myclasses, 'Class created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Clas $myclasses): JsonResponse
    {
        $myclasses->load(['department', 'classLeader', 'members']);

        return $this->success($myclasses);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Clas $myclasses): JsonResponse
    {
        $validated = $request->validate([
            'class_name' => 'sometimes|required|string|max:255',
            'department_id' => 'sometimes|required|exists:departments,id',
            'class_leader_id' => 'nullable|exists:users,id',
        ]);

        $myclasses->update($validated);
        $myclasses->load(['department', 'classLeader']);

        return $this->success($myclasses, 'Class updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Clas $myclasses): JsonResponse
    {
        $myclasses->delete();

        return $this->success(null, 'Class deleted successfully');
    }
}