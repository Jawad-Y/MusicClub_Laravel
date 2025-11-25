<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $memberships = Membership::with(['user'])->get();
        
        return $this->success($memberships);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $membership = Membership::create($validated);
        $membership->load(['user']);

        return $this->success($membership, 'Membership created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Membership $membership): JsonResponse
    {
        $membership->load(['user']);
        
        return $this->success($membership);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Membership $membership): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|required|exists:users,id',
            'status' => 'sometimes|required|string|max:255',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $membership->update($validated);
        $membership->load(['user']);

        return $this->success($membership, 'Membership updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Membership $membership): JsonResponse
    {
        $membership->delete();

        return $this->success(null, 'Membership deleted successfully', 204);
    }
}
