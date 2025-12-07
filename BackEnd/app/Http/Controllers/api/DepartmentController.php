<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
    use ApiResponse;

    /**
     * Display a list of all departments.
     */
    public function index(Request $request): JsonResponse
    {
        // Load departments with their leader relation (if defined in the model)
        $query = Department::with('leader');
        
        Log::info('Department Index Request', [
            'has_department_leader_id' => $request->has('_department_leader_id'),
            'has_accessible_department_ids' => $request->has('_accessible_department_ids'),
            'accessible_department_ids' => $request->input('_accessible_department_ids'),
            'has_class_leader_filter' => $request->has('_class_leader_filter'),
        ]);
        
        // If department leader, only show their own department
        if ($request->has('_department_leader_id')) {
            $query->where('leader_id', $request->input('_department_leader_id'));
        }
        
        // If trainer or trainee, only show departments of their enrolled classes
        if ($request->has('_accessible_department_ids')) {
            $departmentIds = $request->input('_accessible_department_ids');
            if (empty($departmentIds)) {
                // If user has no classes, return empty array
                return $this->success([]);
            }
            $query->whereIn('id', $departmentIds);
        }
        
        // If class leader, only show departments that contain their classes
        if ($request->has('_class_leader_filter')) {
            $userId = $request->user()->id;
            $query->whereHas('classes', function ($q) use ($userId) {
                $q->where('class_leader_id', $userId);
            });
        }
        
        $departments = $query->orderBy('id', 'asc')->get();

        return $this->success($departments);
    }

    /**
     * Store a newly created department in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate input data
        $validated = $request->validate([
            'department_name' => ['required', 'string', 'max:100', 'unique:departments,department_name'],
            'leader_id'       => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $department = Department::create([
            'department_name' => $validated['department_name'],
            'leader_id'       => $validated['leader_id'] ?? null,
        ]);

        // Load leader relation if it exists
        $department->load('leader');

        return $this->success($department, 'Department created successfully', 201);
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department): JsonResponse
    {
        $department->load('leader');

        return $this->success($department);
    }

    /**
     * Update the specified department in storage.
     */
    public function update(Request $request, Department $department): JsonResponse
    {
        // Validate input data
        $validated = $request->validate([
            'department_name' => [
                'required',
                'string',
                'max:100',
                'unique:departments,department_name,' . $department->id,
            ],
            'leader_id'       => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $department->department_name = $validated['department_name'];
        $department->leader_id       = $validated['leader_id'] ?? null;
        $department->save();

        $department->load('leader');

        return $this->success($department, 'Department updated successfully');
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return $this->success(null, 'Department deleted successfully', 204);
    }
}