<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\Instrument;
use App\Models\InstrumentType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InstrumentController extends Controller
{
    use ApiResponse;
    
    public function index(Request $request): JsonResponse
    {
        $query = Instrument::with('type');

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
                  ->orWhere('unique_code', 'LIKE', "%$search%");
            });
        }

        $instruments = $query->get();

        return $this->success($instruments);
    }

    public function show($id): JsonResponse
    {
        $instrument = Instrument::with('type')->findOrFail($id);

        return $this->success($instrument);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unique_code' => 'required|string|max:255|unique:instruments,unique_code',
            'instrument_type_id' => 'required|exists:instrument_types,id',
            'condition' => 'nullable|string|max:255',
            'availability' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $instrument = Instrument::create($validated);
        $instrument->load('type');

        return $this->success($instrument, 'Instrument created successfully', 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $instrument = Instrument::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes','string','max:255'],
            'unique_code' => ['sometimes','string','max:255', Rule::unique('instruments')->ignore($id)],
            'instrument_type_id' => ['sometimes','exists:instrument_types,id'],
            'condition' => ['nullable','string','max:255'],
            'availability' => ['nullable','string','max:255'],
            'description' => ['nullable','string'],
        ]);

        $instrument->update($validated);
        $instrument->load('type');

        return $this->success($instrument, 'Instrument updated successfully');
    }

    public function destroy($id): JsonResponse
    {
        $instrument = Instrument::findOrFail($id);
        $instrument->delete();

        return $this->success(null, 'Instrument deleted successfully', 204);
    }

    public function restore($id): JsonResponse
    {
        $instrument = Instrument::withTrashed()->findOrFail($id);
        $instrument->restore();
        $instrument->load('instrumentType');

        return $this->success($instrument, 'Instrument restored successfully');
    }

    public function duplicate($id): JsonResponse
    {
        $instrument = Instrument::findOrFail($id);
        $newInstrument = $instrument->replicate();
        $newInstrument->unique_code = $instrument->unique_code . '_copy';
        $newInstrument->save();
        $newInstrument->load('instrumentType');

        return $this->success($newInstrument, 'Instrument duplicated successfully', 201);
    }

    public function history($id): JsonResponse
    {
        $instrument = Instrument::findOrFail($id);
        
        $history = [];

        return $this->success([
            'instrument' => $instrument,
            'history' => $history
        ]);
    }

    public function exportExcel()
    {
        return Excel::download(new class implements FromCollection, WithHeadings {
            public function collection()
            {
                return Instrument::select('id','name','unique_code','instrument_type_id','condition','availability','description','created_at','updated_at')->get();
            }
            
            public function headings(): array
            {
                return ['ID','Name','Unique Code','Instrument Type ID','Condition','Availability','Description','Created At','Updated At'];
            }
        }, 'instruments.xlsx');
    }

    public function exportCsv()
    {
        return Excel::download(new class implements FromCollection, WithHeadings {
            public function collection()
            {
                return Instrument::select('id','name','unique_code','instrument_type_id','condition','availability','description','created_at','updated_at')->get();
            }
            
            public function headings(): array
            {
                return ['ID','Name','Unique Code','Instrument Type ID','Condition','Availability','Description','Created At','Updated At'];
            }
        }, 'instruments.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}
