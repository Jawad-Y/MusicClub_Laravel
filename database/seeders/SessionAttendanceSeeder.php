<?php

namespace Database\Seeders;

use App\Models\SessionAttendance;
use Illuminate\Database\Seeder;

class SessionAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['present', 'absent', 'late'];
        $confirmations = ['confirmed', 'pending', 'declined'];

        // Create attendance records for training sessions
        for ($sessionId = 1; $sessionId <= 20; $sessionId++) {
            for ($traineeId = 6; $traineeId <= 15; $traineeId++) {
                SessionAttendance::create([
                    'session_id' => $sessionId,
                    'trainee_id' => $traineeId,
                    'status' => $statuses[array_rand($statuses)],
                    'confirmation' => $confirmations[array_rand($confirmations)],
                ]);
            }
        }
    }
}
