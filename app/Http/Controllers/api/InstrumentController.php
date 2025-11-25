<?php

namespace App\Http\Controllers;

use App\Models\Instrument;
use App\Models\InstrumentType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InstrumentController extends Controller
{
    
    public function index(Request $request)
    {
        $query = Instrument::with('instrumentType');

        
        if ($request->has('type_id')) {
            $query->where('instrument_type_id', $request->type_id);
        }

        
        if ($request->has('condition')) {
            $query->where('condition', $request->condition);
        }

        
        if ($request->has('availability')) {
            $query->where('availability', $request->availability);
        }

        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('serial_number', 'LIKE', "%$search%");
            });
        }

        $instruments = $query->get();

        return response()->json($instruments);
    }

    
    public function show($id)
    {
        $instrument = Instrument::with('instrumentType')->findOrFail($id);

        return response()->json($instrument);
    }

    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'required|string|max:255|unique:instruments,serial_number',
            'instrument_type_id' => 'required|exists:instrument_types,id',
            'condition' => 'nullable|string|max:255',
            'availability' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $instrument = Instrument::create($request->all());

        return response()->json([
            'message' => 'Instrument created successfully',
            'data' => $instrument
        ], 201);
    }

    
    public function update(Request $request, $id)
    {
        $instrument = Instrument::findOrFail($id);

        $request->validate([
            'name' => ['sometimes','string','max:255'],
            'serial_number' => ['sometimes','string','max:255', Rule::unique('instruments')->ignore($id)],
            'instrument_type_id' => ['sometimes','exists:instrument_types,id'],
            'condition' => ['nullable','string','max:255'],
            'availability' => ['nullable','string','max:255'],
            'description' => ['nullable','string'],
        ]);

        $instrument->update($request->all());

        return response()->json([
            'message' => 'Instrument updated successfully',
            'data' => $instrument
        ]);
    }

    
    public function destroy($id)
    {
        $instrument = Instrument::findOrFail($id);
        $instrument->delete();

        return response()->json([
            'message' => 'Instrument deleted successfully'
        ]);
    }

    
    public function softDelete($id)
    {
        $instrument = Instrument::findOrFail($id);
        $instrument->delete();

        return response()->json([
            'message' => 'Instrument soft-deleted successfully'
        ]);
    }

    public function restore($id)
    {
        $instrument = Instrument::withTrashed()->findOrFail($id);
        $instrument->restore();

        return response()->json([
            'message' => 'Instrument restored successfully',
            'data' => $instrument
        ]);
    }

    
    public function duplicate($id)
    {
        $instrument = Instrument::findOrFail($id);
        $newInstrument = $instrument->replicate();
        $newInstrument->serial_number = $instrument->serial_number . '_copy';
        $newInstrument->save();

        return response()->json([
            'message' => 'Instrument duplicated successfully',
            'data' => $newInstrument
        ]);
    }

    
    public function history($id)
    {
        $instrument = Instrument::findOrFail($id);
        
        $history = []; 

        return response()->json([
            'instrument' => $instrument,
            'history' => $history
        ]);
    }
    public function exportExcel()
    {
        return Excel::download(new class implements FromCollection, WithHeadings {
            public function collection()
            {
                return Instrument::select('id','name','serial_number','instrument_type_id','condition','availability','description','created_at','updated_at')->get();
            }
            
            public function headings(): array
            {
                return ['ID','Name','Serial Number','Instrument Type ID','Condition','Availability','Description','Created At','Updated At'];
            }
        }, 'instruments.xlsx');
    }

    public function exportCsv()
    {
        return Excel::download(new class implements FromCollection, WithHeadings {
            public function collection()
            {
                return Instrument::select('id','name','serial_number','instrument_type_id','condition','availability','description','created_at','updated_at')->get();
            }
            
            public function headings(): array
            {
                return ['ID','Name','Serial Number','Instrument Type ID','Condition','Availability','Description','Created At','Updated At'];
            }
        }, 'instruments.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}
