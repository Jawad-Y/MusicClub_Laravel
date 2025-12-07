<?php

namespace Database\Seeders;

use App\Models\HomeworkSubmission;
use Illuminate\Database\Seeder;

class HomeworkSubmissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create submissions for homework
        for ($homeworkId = 1; $homeworkId <= 15; $homeworkId++) {
            for ($traineeId = 6; $traineeId <= 12; $traineeId++) {
                HomeworkSubmission::create([
                    'homework_id' => $homeworkId,
                    'trainee_id' => $traineeId,
                    'file_url' => '/submissions/homework_' . $homeworkId . '_user_' . $traineeId . '.pdf',
                    'notes' => 'Submission notes for homework ' . $homeworkId,
                    'submitted_at' => now()->subDays(rand(1, 10)),
                ]);
            }
        }
    }
}
