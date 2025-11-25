<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\ClassMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassMemberController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $classMembers = ClassMember::with(['class', 'user'])->get();
        
        return $this->success($classMembers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|max:255',
            'class_id' => 'required|exists:classes,id',
        ]);

        $classMember = ClassMember::create($validated);
        $classMember->load(['class', 'user']);

        return $this->success($classMember, 'Class member created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassMember $classMember): JsonResponse
    {
        $classMember->load(['class', 'user']);
        
        return $this->success($classMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClassMember $classMember): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'role' => 'sometimes|required|string|max:255',
            'class_id' => 'sometimes|required|exists:classes,id',
        ]);

        $classMember->update($validated);
        $classMember->load(['class', 'user']);

        return $this->success($classMember, 'Class member updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassMember $classMember): JsonResponse
    {
        $classMember->delete();
        
        return $this->success(null, 'Class member deleted successfully', 204);
    }
}
