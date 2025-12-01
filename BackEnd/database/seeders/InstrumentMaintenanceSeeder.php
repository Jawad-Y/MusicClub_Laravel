<?php

namespace Database\Seeders;

use App\Models\InstrumentMaintenance;
use Illuminate\Database\Seeder;

class InstrumentMaintenanceSeeder extends Seeder
{
    public function run(): void
    {
        $descriptions = [
            'String replacement',
            'Valve oiling',
            'Pad replacement',
            'Neck adjustment',
            'General cleaning',
            'Tuning machine repair',
            'Spring replacement',
        ];

        // Create maintenance records
        for ($i = 1; $i <= 15; $i++) {
            InstrumentMaintenance::create([
                'instrument_id' => rand(1, 19),
                'description' => $descriptions[array_rand($descriptions)],
                'date' => now()->subDays(rand(1, 60))->format('Y-m-d'),
                'notes' => 'Maintenance completed successfully.',
            ]);
        }
    }
}
