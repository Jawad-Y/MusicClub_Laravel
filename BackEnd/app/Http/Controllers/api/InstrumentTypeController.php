<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\InstrumentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstrumentTypeController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = InstrumentType::query();

        if ($request->has('status')) {
            if ($request->status === 'deleted') {
                $query = $query->onlyTrashed();
            } elseif ($request->status === 'active') {
                $query = $query->whereNull('deleted_at');
            }
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query = $query->where('name', 'LIKE', "%$search%");
        }

        $instrumentTypes = $query->get();

        return $this->success($instrumentTypes);
    }

    public function show($id): JsonResponse
    {
        $instrumentType = InstrumentType::with('instruments')->findOrFail($id);

        return $this->success($instrumentType);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|unique:instrument_types,name|max:255',
        ]);

        $instrumentType = InstrumentType::create($validated);

        return $this->success($instrumentType, 'Instrument type created successfully', 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $instrumentType = InstrumentType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|unique:instrument_types,name,' . $id . '|max:255',
        ]);

        $instrumentType->update($validated);

        return $this->success($instrumentType, 'Instrument type updated successfully');
    }

    public function destroy($id): JsonResponse
    {
        $instrumentType = InstrumentType::findOrFail($id);

        if ($instrumentType->instruments()->count() > 0) {
            return $this->error('Cannot delete: instruments are linked to this type.', 400);
        }

        $instrumentType->delete();

        return $this->success(null, 'Instrument type deleted successfully', 204);
    }

    public function restore($id): JsonResponse
    {
        $instrumentType = InstrumentType::withTrashed()->findOrFail($id);
        $instrumentType->restore();

        return $this->success($instrumentType, 'Instrument type restored successfully');
    }
}
