<?php

namespace Database\Seeders;

use App\Models\UserAssignment;
use Illuminate\Database\Seeder;

class UserAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        // Assign trainees to classes, departments, and instruments
        for ($userId = 6; $userId <= 15; $userId++) {
            UserAssignment::create([
                'user_id' => $userId,
                'class_id' => rand(1, 7),
                'department_id' => rand(1, 5),
                'instrument_id' => rand(1, 19),
                'start_date' => now()->subDays(rand(1, 30))->format('Y-m-d'),
                'end_date' => null,
            ]);
        }

        // Assign managers to departments
        for ($managerId = 2; $managerId <= 3; $managerId++) {
            UserAssignment::create([
                'user_id' => $managerId,
                'class_id' => null,
                'department_id' => rand(1, 5),
                'instrument_id' => null,
                'start_date' => now()->subDays(90)->format('Y-m-d'),
                'end_date' => null,
            ]);
        }
    }
}
