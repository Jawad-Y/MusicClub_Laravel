<?php

namespace Database\Seeders;

use App\Models\ClothingAssignment;
use Illuminate\Database\Seeder;

class ClothingAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        // Assign clothing to trainees
        for ($i = 1; $i <= 10; $i++) {
            ClothingAssignment::create([
                'item_id' => rand(1, 36),
                'user_id' => 5 + $i,
                'assigned_at' => now()->subDays(rand(1, 30)),
                'returned_at' => null,
            ]);
        }

        // Some returned clothing
        for ($i = 1; $i <= 3; $i++) {
            ClothingAssignment::create([
                'item_id' => rand(1, 36),
                'user_id' => 5 + $i,
                'assigned_at' => now()->subDays(rand(60, 90)),
                'returned_at' => now()->subDays(rand(1, 29)),
            ]);
        }
    }
}
