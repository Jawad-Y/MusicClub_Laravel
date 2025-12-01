<?php

namespace Database\Seeders;

use App\Models\PerformanceReview;
use Illuminate\Database\Seeder;

class PerformanceReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Create performance reviews
        for ($i = 1; $i <= 30; $i++) {
            PerformanceReview::create([
                'trainee_id' => rand(6, 15),
                'trainer_id' => rand(4, 5),
                'session_id' => rand(1, 20),
                'rating' => rand(1, 5),
                'notes' => 'Good progress. Keep practicing scales and rhythm work.',
            ]);
        }
    }
}
