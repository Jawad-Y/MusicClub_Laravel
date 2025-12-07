<?php

namespace Database\Seeders;

use App\Models\Homework;
use Illuminate\Database\Seeder;

class HomeworkSeeder extends Seeder
{
    public function run(): void
    {
        $descriptions = [
            'Practice scales for 30 minutes daily',
            'Complete music theory exercises from chapter 3',
            'Listen to the provided recordings and take notes',
            'Prepare a piece for performance',
            'Write reflection on last session',
            'Transcribe the melody played in class',
            'Work on finger exercises',
        ];

        for ($i = 1; $i <= 15; $i++) {
            Homework::create([
                'session_id' => rand(1, 20),
                'assign_scope' => rand(0, 1) ? 'individual' : 'class',
                'description' => $descriptions[array_rand($descriptions)],
                'due_date' => now()->addDays(rand(3, 14))->format('Y-m-d'),
            ]);
        }
    }
}
