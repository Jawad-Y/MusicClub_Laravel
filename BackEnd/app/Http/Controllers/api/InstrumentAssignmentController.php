<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\InstrumentAssignment;
use App\Models\Instrument;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InstrumentAssignmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = InstrumentAssignment::with([
            'instrument',
            'user:id,full_name,email'
        ]);

        if ($request->status) {
            if ($request->status === 'assigned') {
                $query->whereNull('returned_at');
            } elseif ($request->status === 'returned') {
                $query->whereNotNull('returned_at');
            } elseif ($request->status === 'late') {
                $query->whereNull('returned_at')
                      ->where('assigned_at', '<', now()->subDays(30));
            }
        }

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('assigned_at', [$request->start_date, $request->end_date]);
        }

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('full_name', 'LIKE', "%$search%");
            })->orWhereHas('instrument', function ($q) use ($search) {
                $q->where('unique_code', 'LIKE', "%$search%");
            });
        }

        $assignments = $query->get();

        return $this->success($assignments);
    }

    public function show($id): JsonResponse
    {
        $assignment = InstrumentAssignment::with([
            'instrument',
            'user:id,full_name,email'
        ])->findOrFail($id);
        
        return $this->success($assignment);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instrument_id' => 'required|exists:instruments,id',
            'user_id' => 'required|exists:users,id',
            'assigned_at' => 'required|date',
        ]);

        if (!$this->isAvailable($validated['instrument_id'])) {
            return $this->error('Instrument not available', 422);
        }

        // Normalize datetime fields to MySQL format if ISO strings were provided
        if (!empty($validated['assigned_at'])) {
            $validated['assigned_at'] = Carbon::parse($validated['assigned_at'])->toDateTimeString();
        }

        $assignment = InstrumentAssignment::create($validated);

        Instrument::where('id', $validated['instrument_id'])
            ->update(['condition' => 'assigned']);

        $assignment->load(['instrument', 'user:id,full_name,email']);

        return $this->success($assignment, 'Assignment created successfully', 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $assignment = InstrumentAssignment::findOrFail($id);

        $validated = $request->validate([
            'assigned_at' => 'sometimes|date',
            'returned_at' => 'sometimes|date|nullable',
        ]);

        // Normalize incoming ISO datetime strings to MySQL format
        if (array_key_exists('assigned_at', $validated) && $validated['assigned_at'] !== null) {
            $validated['assigned_at'] = Carbon::parse($validated['assigned_at'])->toDateTimeString();
        }

        if (array_key_exists('returned_at', $validated) && $validated['returned_at'] !== null) {
            $validated['returned_at'] = Carbon::parse($validated['returned_at'])->toDateTimeString();
            
            // Update instrument condition to 'available' when returned
            Instrument::where('id', $assignment->instrument_id)
                ->update(['condition' => 'available']);
        }

        $assignment->update($validated);
        $assignment->load(['instrument', 'user:id,full_name,email']);

        return $this->success($assignment, 'Assignment updated successfully');
    }

    public function destroy($id): JsonResponse
    {
        $assignment = InstrumentAssignment::findOrFail($id);
        $assignment->delete();

        return $this->success(null, 'Assignment deleted successfully', 204);
    }

    public function restore($id): JsonResponse
    {
        $assignment = InstrumentAssignment::withTrashed()->findOrFail($id);
        $assignment->restore();
        $assignment->load(['instrument', 'user:id,full_name,email']);

        return $this->success($assignment, 'Assignment restored successfully');
    }

    public function returnInstrument($id): JsonResponse
    {
        $assignment = InstrumentAssignment::findOrFail($id);

        if ($assignment->returned_at) {
            return $this->error('Instrument already returned', 422);
        }

        $assignment->update([
            'returned_at' => now(),
        ]);

        Instrument::where('id', $assignment->instrument_id)
            ->update(['condition' => 'available']);

        $assignment->load(['instrument', 'user:id,full_name,email']);

        return $this->success($assignment, 'Instrument returned successfully');
    }

    private function isAvailable($instrument_id): bool
    {
        return !InstrumentAssignment::where('instrument_id', $instrument_id)
            ->whereNull('returned_at')
            ->exists();
    }

    public function checkAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instrument_id' => 'required|exists:instruments,id',
        ]);

        return $this->success([
            'available' => $this->isAvailable($validated['instrument_id']),
        ]);
    }

    public function getByUser($user_id): JsonResponse
    {
        $assignments = InstrumentAssignment::with([
            'instrument',
            'user:id,full_name,email'
        ])
            ->where('user_id', $user_id)
            ->get();

        return $this->success($assignments);
    }

    public function getByInstrument($instrument_id): JsonResponse
    {
        $assignments = InstrumentAssignment::with([
            'instrument',
            'user:id,full_name,email'
        ])
            ->where('instrument_id', $instrument_id)
            ->get();

        return $this->success($assignments);
    }

    public function exportHistory(): JsonResponse
    {
        $data = InstrumentAssignment::with([
            'instrument',
            'user:id,full_name,email'
        ])->get();

        return $this->success($data);
    }
}

