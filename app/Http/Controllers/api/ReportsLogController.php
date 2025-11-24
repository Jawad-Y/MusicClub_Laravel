<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReportsLog;
use Illuminate\Http\Request;

class ReportsLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $reportsLogs = ReportsLog::with(['creator'])->get();
        return response()->json($reportsLogs);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'created_by' => 'required|exists:users,id',
            'type' => 'required|string|max:255',
            'created_at_report' => 'required|date',
        ]);

        $reportsLog = ReportsLog::create($validated);
        $reportsLog->load(['creator']);

        return response()->json($reportsLog, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ReportsLog $reportsLog)
    {
        $reportsLog->load(['creator']);
        return response()->json($reportsLog);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ReportsLog $reportsLog)
    {
        $validated = $request->validate([
            'created_by' => 'sometimes|required|exists:users,id',
            'type' => 'sometimes|required|string|max:255',
            'created_at_report' => 'sometimes|required|date',
        ]);

        $reportsLog->update($validated);
        $reportsLog->load(['creator']);

        return response()->json($reportsLog);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ReportsLog $reportsLog)
    {
        $reportsLog->delete();

        return response()->json(null, 204);
    }
}
