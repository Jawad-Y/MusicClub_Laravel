<?php

namespace Database\Seeders;

use App\Models\TrainingSession;
use Illuminate\Database\Seeder;

class TrainingSessionSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            'Introduction to Music',
            'Basic Technique',
            'Scale Practice',
            'Music Reading',
            'Rhythm Training',
            'Ensemble Playing',
            'Performance Preparation',
        ];

        $locations = ['Studio A', 'Studio B', 'Main Hall', 'Practice Room 1', 'Practice Room 2'];

        for ($i = 1; $i <= 20; $i++) {
            TrainingSession::create([
                'class_id' => rand(1, 7),
                'trainer_id' => rand(4, 5),
                'subject' => $subjects[array_rand($subjects)],
                'date' => now()->addDays(rand(1, 30))->format('Y-m-d'),
                'start_time' => rand(8, 16) . ':00:00',
                'end_time' => rand(17, 18) . ':00:00',
                'location' => $locations[array_rand($locations)],
                'description' => 'Training session for music club members',
            ]);
        }
    }
}
