<?php

namespace Database\Seeders;

use App\Models\ReportsLog;
use Illuminate\Database\Seeder;

class ReportsLogSeeder extends Seeder
{
    public function run(): void
    {
        $types = ['attendance', 'performance', 'instruments', 'membership', 'events', 'homework'];

        for ($i = 1; $i <= 20; $i++) {
            ReportsLog::create([
                'created_by' => rand(2, 3),
                'type' => $types[array_rand($types)],
                'created_at_report' => now()->subDays(rand(1, 30)),
            ]);
        }
    }
}
