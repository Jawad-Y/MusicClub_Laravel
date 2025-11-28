<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Instrument;
use App\Models\InstrumentMaintenance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InstrumentMaintenanceController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = InstrumentMaintenance::query()->with('instrument');

        // Filter for department leaders and class leaders - only show maintenances for instruments assigned to their class members
        // Inventory managers have full access
        if (($user->isDepartmentLeader() || $user->isClassLeader()) && !$user->isInventoryManager()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            $instrumentIds = \App\Models\InstrumentAssignment::whereIn('user_id', $accessibleUserIds)
                ->whereNull('returned_at')
                ->pluck('instrument_id')
                ->unique();
            
            $query->whereIn('instrument_id', $instrumentIds);
        }

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

        $maintenances = $query->orderBy('date', 'desc')->paginate($perPage);

        return $this->success($maintenances);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $query = InstrumentMaintenance::query()->with('instrument');

        // Filter for department leaders and class leaders, but not for inventory managers
        if (($user->isDepartmentLeader() || $user->isClassLeader()) && !$user->isInventoryManager()) {
            $accessibleUserIds = $user->getAccessibleUserIds();
            $instrumentIds = \App\Models\InstrumentAssignment::whereIn('user_id', $accessibleUserIds)
                ->whereNull('returned_at')
                ->pluck('instrument_id')
                ->unique();
            
            $query->whereIn('instrument_id', $instrumentIds);
        }

        $maintenance = $query->findOrFail($id);
        
        return $this->success($maintenance);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'instrument_id' => 'required|exists:instruments,id',
            'description' => 'required|string',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::in(['pending','done'])],
        ]);

        $maintenance = InstrumentMaintenance::create($validated);
        $maintenance->load('instrument');

        return $this->success($maintenance, 'Maintenance record created successfully', 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $maintenance = InstrumentMaintenance::findOrFail($id);

        $validated = $request->validate([
            'instrument_id' => 'sometimes|exists:instruments,id',
            'description' => 'sometimes|string',
            'date' => 'sometimes|date',
            'notes' => 'nullable|string',
            'status' => ['nullable', Rule::in(['pending','done'])],
        ]);

        $maintenance->update($validated);
        $maintenance->load('instrument');

        return $this->success($maintenance, 'Maintenance record updated successfully');
    }

    public function destroy($id): JsonResponse
    {
        $maintenance = InstrumentMaintenance::findOrFail($id);
        $maintenance->delete();

        return $this->success(null, 'Maintenance record deleted successfully', 204);
    }

    public function restore($id): JsonResponse
    {
        $maintenance = InstrumentMaintenance::withTrashed()->findOrFail($id);
        $maintenance->restore();
        $maintenance->load('instrument');

        return $this->success($maintenance, 'Maintenance record restored successfully');
    }

    public function getByInstrument($instrument_id): JsonResponse
    {
        $maintenances = InstrumentMaintenance::with('instrument')
            ->where('instrument_id', $instrument_id)
            ->orderBy('date', 'desc')
            ->get();

        return $this->success($maintenances);
    }

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string',
            'per_page' => 'nullable|integer|min:1',
        ]);

        $q = $validated['q'];
        $perPage = (int) ($validated['per_page'] ?? 10);

        $query = InstrumentMaintenance::with('instrument')
            ->where(function ($qself) use ($q) {
                $qself->where('description', 'LIKE', "%{$q}%")
                      ->orWhere('notes', 'LIKE', "%{$q}%");
            });

        $maintenances = $query->orderBy('date', 'desc')->paginate($perPage);

        return $this->success($maintenances);
    }

    public function exportHistory(Request $request): JsonResponse
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

        return $this->success($data);
    }
}

