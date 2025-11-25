<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json(Event::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string',
            'date'        => 'nullable|date',
            'location'    => 'nullable|string|max:150',
            'created_by'  => 'required|exists:users,id',
        ]);

        $event = Event::create($validated);

        return response()->json($event, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event): JsonResponse
    {
        return response()->json($event);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'date'        => 'nullable|date',
            'location'    => 'nullable|string|max:150',
            'created_by'  => 'sometimes|exists:users,id',
        ]);

        $event->update($validated);

        return response()->json($event);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully'
        ], 200);
    }
}
