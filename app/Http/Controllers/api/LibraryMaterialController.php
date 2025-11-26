<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\LibraryMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LibraryMaterialController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'instrument_type_id' => 'nullable|integer|exists:instrument_types,id',
            'uploaded_by'        => 'nullable|integer|exists:users,id',
            'limit'              => 'nullable|integer|min:1|max:100'
        ]);

        $limit = $request->input('limit', 20);

        $query = LibraryMaterial::with([
            'instrumentType:id,name',
            'uploader:id,name,email'
        ]);

        if ($request->filled('instrument_type_id')) {
            $query->where('instrument_type_id', $request->instrument_type_id);
        }

        if ($request->filled('uploaded_by')) {
            $query->where('uploaded_by', $request->uploaded_by);
        }

        $materials = $query->orderBy('uploaded_at', 'desc')
            ->paginate($limit, ['id','title','description','file_url','instrument_type_id','uploaded_by','uploaded_at']);

        $materials->getCollection()->transform(function($material) {
            if ($material->file_url) {
                $material->file_url = asset('storage/' . $material->file_url);
            }
            return $material;
        });

        return $this->success($materials);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'               => 'required|string|max:255',
            'description'         => 'nullable|string',
            'file'                => 'required|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
            'instrument_type_id'  => 'required|integer|exists:instrument_types,id',
            'uploaded_by'         => 'required|integer|exists:users,id',
        ]);

        $path = $request->file('file')->store('library_materials', 'public');
        $validated['file_url'] = $path;
        $validated['uploaded_at'] = now();

        $material = LibraryMaterial::create($validated);
        $material->load(['instrumentType:id,name', 'uploader:id,name,email']);
        $material->file_url = asset('storage/' . $material->file_url);

        return $this->success($material, 'Material uploaded successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $material = LibraryMaterial::with(['instrumentType:id,name', 'uploader:id,name,email'])
            ->findOrFail($id);

        if ($material->file_url) {
            $material->file_url = asset('storage/' . $material->file_url);
        }

        return $this->success($material);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $material = LibraryMaterial::findOrFail($id);

        $validated = $request->validate([
            'title'               => 'sometimes|string|max:255',
            'description'         => 'nullable|string',
            'file'                => 'nullable|file|mimes:pdf,doc,docx,png,jpg,jpeg|max:10240',
            'instrument_type_id'  => 'sometimes|integer|exists:instrument_types,id',
            'uploaded_by'         => 'sometimes|integer|exists:users,id',
        ]);

        if ($request->hasFile('file')) {
            if ($material->file_url && Storage::disk('public')->exists($material->file_url)) {
                Storage::disk('public')->delete($material->file_url);
            }

            $path = $request->file('file')->store('library_materials', 'public');
            $validated['file_url'] = $path;
        }

        $material->update($validated);
        $material->load(['instrumentType:id,name', 'uploader:id,name,email']);

        if ($material->file_url) {
            $material->file_url = asset('storage/' . $material->file_url);
        }

        return $this->success($material, 'Material updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $material = LibraryMaterial::findOrFail($id);

        if ($material->file_url && Storage::disk('public')->exists($material->file_url)) {
            Storage::disk('public')->delete($material->file_url);
        }

        $material->delete();

        return $this->success(null, 'Material deleted successfully', 204);
    }
}
