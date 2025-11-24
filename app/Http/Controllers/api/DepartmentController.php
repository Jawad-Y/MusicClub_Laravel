<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    /**
     * Display a list of all departments.
     */
    public function index()
    {
        // Load departments with their leader relation (if defined in the model)
        $departments = Department::with('leader')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $departments,
        ]);
    }

    /**
     * Store a newly created department in storage.
     */
    public function store(Request $request)
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

        return response()->json([
            'status'  => true,
            'message' => 'Department created successfully.',
            'data'    => $department,
        ], 201);
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department)
    {
        $department->load('leader');

        return response()->json([
            'status' => true,
            'data'   => $department,
        ]);
    }

    /**
     * Update the specified department in storage.
     */
    public function update(Request $request, Department $department)
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

        return response()->json([
            'status'  => true,
            'message' => 'Department updated successfully.',
            'data'    => $department,
        ]);
    }

    /**
     * Remove the specified department from storage.
     */
    public function destroy(Department $department)
    {
        $department->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Department deleted successfully.',
        ]);
    }
}