<?php

namespace Database\Seeders;

use App\Models\EventParticipant;
use Illuminate\Database\Seeder;

class EventParticipantSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['performer', 'organizer', 'volunteer', 'audience'];

        // Assign participants to events
        for ($eventId = 1; $eventId <= 10; $eventId++) {
            for ($i = 0; $i < 8; $i++) {
                EventParticipant::create([
                    'event_id' => $eventId,
                    'user_id' => rand(6, 15),
                    'role' => $roles[array_rand($roles)],
                ]);
            }
        }
    }
}
