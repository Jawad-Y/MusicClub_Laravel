<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\EventParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventParticipantController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $request->input('limit', 20);

        $participants = EventParticipant::with([
            'event:id,title,date',
            'user:id,full_name,email'
        ])->orderBy('id', 'desc')
          ->get();

        return $this->success($participants);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $participant = EventParticipant::with([
            'event:id,title,date',
            'user:id,full_name,email'
        ])->findOrFail($id);

        return $this->success($participant);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'event_id' => 'required|integer|exists:events,id',
            'user_id'  => 'required|integer|exists:users,id',
            'role'     => 'nullable|string|max:255',
        ]);

        $participant = EventParticipant::firstOrCreate(
            [
                'event_id' => $validated['event_id'],
                'user_id'  => $validated['user_id'],
            ],
            [
                'role' => $validated['role'] ?? null,
            ]
        );

        $participant->load(['event:id,title,date', 'user:id,full_name,email']);

        return $this->success($participant, 'Participant added successfully', 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $participant = EventParticipant::findOrFail($id);

        $validated = $request->validate([
            'event_id' => 'sometimes|integer|exists:events,id',
            'user_id'  => 'sometimes|integer|exists:users,id',
            'role'     => 'nullable|string|max:255',
        ]);

        $participant->update($validated);
        $participant->load(['event:id,title,date', 'user:id,full_name,email']);

        return $this->success($participant, 'Participant updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $participant = EventParticipant::findOrFail($id);
        $participant->delete();

        return $this->success(null, 'Participant removed successfully', 204);
    }
    public function listByEvent(Request $request, $eventId)
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);
        $limit = $request->input('limit', 20);

        $participants = EventParticipant::with('user:id,full_name,email')
            ->where('event_id', $eventId)
            ->orderBy('id', 'desc')
            ->get();

        return $this->success($participants, 'Event participants retrieved successfully');
    }
    public function listByUser(Request $request, $userId)
    {
        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);
        $limit = $request->input('limit', 20);

        $events = EventParticipant::with('event:id,title,date')
            ->where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->get();

        return $this->success($events, 'User events retrieved successfully');
    }
}
