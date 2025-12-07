<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $titles = [
            'Spring Concert',
            'Ensemble Competition',
            'Music Festival',
            'Student Recital',
            'Workshop: Advanced Techniques',
            'Charity Concert',
            'Masterclass with Guest Artist',
        ];

        $locations = ['Main Hall', 'Auditorium', 'Theater', 'Community Center', 'Concert Hall'];

        for ($i = 1; $i <= 10; $i++) {
            Event::create([
                'title' => $titles[array_rand($titles)],
                'description' => 'An exciting event for music club members',
                'date' => now()->addDays(rand(1, 90))->format('Y-m-d'),
                'location' => $locations[array_rand($locations)],
                'created_by' => rand(2, 3),
            ]);
        }
    }
}
