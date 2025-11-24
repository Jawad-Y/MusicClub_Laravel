<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;  // iporting the model
use Illuminate\Http\Request;  // import request

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
      return Event::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. VALIDATE INPUT   
                //   'feild name' => 'rules'
    $validated = $request->validate([
        'title' => 'required|string|max:200',
        'description' => 'nullable|string',
        'date' => 'nullable|date',
        'location' => 'nullable|string|max:150',
        'created_by' => 'required|exists:users,id',
    ]);

    // 2. SAVE TO DATABASE
    return Event::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        return Event::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Event $event)
    {
        //find event by if
        $event = Event::findOrFail($id);
        //checking validation
$validated = $request->validate([
    'title' => 'sometimes|string|max:200',
    'description' => 'nullable|string',
    'date' => 'nullable|date',
    'location' => 'nullable|string|max:150',
    'created_by' => 'sometimes|exists:users,id',
]);
  //updating the event weve craete by $validated info 
$event->update($validated);

return $event;

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event)
    {
        // 1. find the event by id
        $event = Event::findOrFail($id);
        //2. delete founded event 
$event->delete();
        //3. show sucess msg on frontend
return response()->json(['message' => 'Event deleted successfully']);

    }
}
