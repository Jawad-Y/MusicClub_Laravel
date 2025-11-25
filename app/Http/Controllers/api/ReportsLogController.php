<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Models\ReportsLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportsLogController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $reportsLogs = ReportsLog::with(['creator'])->get();
        
        return $this->success($reportsLogs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'created_by' => 'required|exists:users,id',
            'type' => 'required|string|max:255',
            'created_at_report' => 'required|date',
        ]);

        $reportsLog = ReportsLog::create($validated);
        $reportsLog->load(['creator']);

        return $this->success($reportsLog, 'Report log created successfully', 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ReportsLog $reportsLog): JsonResponse
    {
        $reportsLog->load(['creator']);
        
        return $this->success($reportsLog);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReportsLog $reportsLog): JsonResponse
    {
        $validated = $request->validate([
            'created_by' => 'sometimes|required|exists:users,id',
            'type' => 'sometimes|required|string|max:255',
            'created_at_report' => 'sometimes|required|date',
        ]);

        $reportsLog->update($validated);
        $reportsLog->load(['creator']);

        return $this->success($reportsLog, 'Report log updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReportsLog $reportsLog): JsonResponse
    {
        $reportsLog->delete();

        return $this->success(null, 'Report log deleted successfully', 204);
    }
}
