<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassMember;
use Illuminate\Http\Request;

class ClassMemberController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $classMembers = ClassMember::with(['class', 'user'])->get();
        return response()->json($classMembers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|string|max:255',
            'class_id' => 'required|exists:classes,id',
        ]);

        $classMember = ClassMember::create($validated);
        $classMember->load(['class', 'user']);

        return response()->json($classMember, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ClassMember $classMember)
    {
        $classMember->load(['class', 'user']);
        return response()->json($classMember);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ClassMember $classMember)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'role' => 'sometimes|required|string|max:255',
            'class_id' => 'sometimes|required|exists:classes,id',
        ]);

        $classMember->update($validated);
        $classMember->load(['class', 'user']);

        return response()->json($classMember);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ClassMember $classMember)
    {
        $classMember->delete();

        return response()->json(null, 204);
    }
}
