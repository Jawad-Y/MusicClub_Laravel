<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clas;
use Illuminate\Http\Request;

class ClasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $classes = Clas::with(['department', 'classLeader'])->get();
        return response()->json($classes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'class_name' => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'class_leader_id' => 'nullable|exists:users,id',
        ]);

        $clas = Clas::create($validated);
        $clas->load(['department', 'classLeader']);

        return response()->json($clas, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Clas $clas)
    {
        $clas->load(['department', 'classLeader', 'members']);

        return response()->json($clas);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Clas $clas)
    {
        $validated = $request->validate([
            'class_name' => 'sometimes|required|string|max:255',
            'department_id' => 'sometimes|required|exists:departments,id',
            'class_leader_id' => 'nullable|exists:users,id',
        ]);

        $clas->update($validated);
        $clas->load(['department', 'classLeader']);

        return response()->json($clas);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Clas $clas)
    {
        $clas->delete();

        return response()->json(null, 204);
    }
}