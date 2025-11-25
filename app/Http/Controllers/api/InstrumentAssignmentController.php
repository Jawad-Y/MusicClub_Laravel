<?php

namespace App\Http\Controllers;

use App\Models\InstrumentAssignment;
use App\Models\Instrument;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstrumentAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = InstrumentAssignment::with(['instrument', 'user']);

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

        return $query->paginate($request->per_page ?? 10);
    }

    public function show($id)
    {
        return InstrumentAssignment::with(['instrument', 'user'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $request->validate([
            'instrument_id' => 'required|exists:instruments,instrument_id',
            'user_id' => 'required|exists:users,user_id',
            'assigned_at' => 'required|date',
        ]);

        if (!$this->isAvailable($request->instrument_id)) {
            return response()->json(['error' => 'Instrument not available'], 422);
        }

        $assignment = InstrumentAssignment::create([
            'instrument_id' => $request->instrument_id,
            'user_id' => $request->user_id,
            'assigned_at' => $request->assigned_at,
        ]);

        Instrument::where('instrument_id', $request->instrument_id)
            ->update(['condition' => 'assigned']);

        return $assignment;
    }

    public function update(Request $request, $id)
    {
        $assignment = InstrumentAssignment::findOrFail($id);

        $request->validate([
            'assigned_at' => 'sometimes|date',
            'returned_at' => 'sometimes|date|nullable',
        ]);

        $assignment->update($request->all());

        return $assignment;
    }

    public function destroy($id)
    {
        $assignment = InstrumentAssignment::findOrFail($id);
        $assignment->forceDelete();

        return ['message' => 'Assignment deleted'];
    }

    public function softDelete($id)
    {
        $assignment = InstrumentAssignment::findOrFail($id);
        $assignment->delete();

        return ['message' => 'Assignment soft-deleted'];
    }

    public function restore($id)
    {
        $assignment = InstrumentAssignment::withTrashed()->findOrFail($id);
        $assignment->restore();

        return ['message' => 'Assignment restored'];
    }

    public function returnInstrument($id)
    {
        $assignment = InstrumentAssignment::findOrFail($id);

        if ($assignment->returned_at) {
            return response()->json(['error' => 'Instrument already returned'], 422);
        }

        $assignment->update([
            'returned_at' => now(),
        ]);

        Instrument::where('instrument_id', $assignment->instrument_id)
            ->update(['condition' => 'available']);

        return ['message' => 'Instrument returned'];
    }

    public function isAvailable($instrument_id)
    {
        return !InstrumentAssignment::where('instrument_id', $instrument_id)
            ->whereNull('returned_at')
            ->exists();
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'instrument_id' => 'required|exists:instruments,instrument_id',
        ]);

        return [
            'available' => $this->isAvailable($request->instrument_id),
        ];
    }

    public function getByUser($user_id)
    {
        return InstrumentAssignment::with(['instrument', 'user'])
            ->where('user_id', $user_id)
            ->get();
    }

    public function getByInstrument($instrument_id)
    {
        return InstrumentAssignment::with(['instrument', 'user'])
            ->where('instrument_id', $instrument_id)
            ->get();
    }

    public function exportHistory()
    {
        $data = InstrumentAssignment::with(['instrument', 'user'])->get();

        return response()->json($data);
    }
}

