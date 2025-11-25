<?php

namespace App\Http\Controllers;

use App\Models\Instrument;
use App\Models\InstrumentMaintenance;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InstrumentMaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = InstrumentMaintenance::query()->with('instrument');

        if ($request->has('instrument_id')) {
            $query->where('instrument_id', $request->instrument_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'LIKE', "%{$s}%")
                  ->orWhere('notes', 'LIKE', "%{$s}%");
            });
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $perPage = (int) ($request->per_page ?? 10);

        return $query->orderBy('date', 'desc')->paginate($perPage);
    }

    public function show($id)
    {
        return InstrumentMaintenance::with('instrument')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'instrument_id' => 'required|exists:instruments,instrument_id',
            'description' => 'required|string',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::in(['pending','done'])],
        ]);

        $maintenance = InstrumentMaintenance::create($data);

        return response()->json($maintenance, 201);
    }

    public function update(Request $request, $id)
    {
        $maintenance = InstrumentMaintenance::findOrFail($id);

        $data = $request->validate([
            'instrument_id' => 'sometimes|exists:instruments,instrument_id',
            'description' => 'sometimes|string',
            'date' => 'sometimes|date',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::in(['pending','done'])],
        ]);

        $maintenance->update($data);

        return response()->json($maintenance);
    }

    public function destroy($id)
    {
        $maintenance = InstrumentMaintenance::findOrFail($id);
        $maintenance->forceDelete();

        return response()->json(['message' => 'Maintenance record deleted']);
    }

    public function softDelete($id)
    {
        $maintenance = InstrumentMaintenance::findOrFail($id);
        $maintenance->delete();

        return response()->json(['message' => 'Maintenance record soft-deleted']);
    }

    public function restore($id)
    {
        $maintenance = InstrumentMaintenance::withTrashed()->findOrFail($id);
        $maintenance->restore();

        return response()->json(['message' => 'Maintenance record restored', 'data' => $maintenance]);
    }

    public function getByInstrument($instrument_id)
    {
        return InstrumentMaintenance::with('instrument')
            ->where('instrument_id', $instrument_id)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string',
            'per_page' => 'nullable|integer|min:1',
        ]);

        $q = $request->q;
        $perPage = (int) ($request->per_page ?? 10);

        $query = InstrumentMaintenance::with('instrument')
            ->where(function ($qself) use ($q) {
                $qself->where('description', 'LIKE', "%{$q}%")
                      ->orWhere('notes', 'LIKE', "%{$q}%");
            });

        return $query->orderBy('date', 'desc')->paginate($perPage);
    }

    public function exportHistory(Request $request)
    {
        $query = InstrumentMaintenance::with('instrument');

        if ($request->has('instrument_id')) {
            $query->where('instrument_id', $request->instrument_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'LIKE', "%{$s}%")
                  ->orWhere('notes', 'LIKE', "%{$s}%");
            });
        }

        $data = $query->orderBy('date', 'desc')->get();

        return response()->json($data);
    }
}

