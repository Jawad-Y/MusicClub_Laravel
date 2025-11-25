<?php

namespace App\Http\Controllers;

use App\Models\InstrumentType;
use Illuminate\Http\Request;

class InstrumentTypeController extends Controller
{
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:instrument_types,name|max:255',
        ]);

        $instrumentType = InstrumentType::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Instrument type created successfully',
            'data' => $instrumentType
        ], 201);
    }

    
    public function update(Request $request, $id)
    {
        $instrumentType = InstrumentType::findOrFail($id);

        $request->validate([
            'name' => 'required|unique:instrument_types,name,' . $id . '|max:255',
        ]);

        $instrumentType->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Instrument type updated successfully',
            'data' => $instrumentType
        ]);
    }

    
    public function destroy($id)
    {
        $instrumentType = InstrumentType::findOrFail($id);

        if ($instrumentType->instruments()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete: instruments are linked to this type.'
            ], 400);
        }

        $instrumentType->delete();

        return response()->json([
            'message' => 'Instrument type deleted successfully'
        ]);
    }

    
    public function softDelete($id)
    {
        $instrumentType = InstrumentType::findOrFail($id);
        $instrumentType->delete(); 

        return response()->json([
            'message' => 'Instrument type soft-deleted successfully'
        ]);
    }

    
    public function restore($id)
    {
        $instrumentType = InstrumentType::withTrashed()->findOrFail($id);
        $instrumentType->restore();

        return response()->json([
            'message' => 'Instrument type restored successfully',
            'data' => $instrumentType
        ]);
    }

    
    public function index(Request $request)
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

    
        $perPage = $request->get('per_page', 10);
        $instrumentTypes = $query->paginate($perPage);

        return response()->json($instrumentTypes);
    }

    public function show($id)
    {
        $instrumentType = InstrumentType::with('instruments')->findOrFail($id);

        return response()->json($instrumentType);
    }
}
