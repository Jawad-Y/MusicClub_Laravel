<?php

namespace Database\Seeders;

use App\Models\InstrumentAssignment;
use Illuminate\Database\Seeder;

class InstrumentAssignmentSeeder extends Seeder
{
    public function run(): void
    {
        // Assign instruments to trainees
        for ($i = 1; $i <= 10; $i++) {
            InstrumentAssignment::create([
                'instrument_id' => rand(1, 19),
                'user_id' => 5 + $i,
                'assigned_at' => now()->subDays(rand(1, 30)),
                'returned_at' => null,
            ]);
        }

        // Some returned instruments
        for ($i = 1; $i <= 5; $i++) {
            InstrumentAssignment::create([
                'instrument_id' => rand(1, 19),
                'user_id' => 5 + $i,
                'assigned_at' => now()->subDays(rand(60, 90)),
                'returned_at' => now()->subDays(rand(1, 29)),
            ]);
        }
    }
}
