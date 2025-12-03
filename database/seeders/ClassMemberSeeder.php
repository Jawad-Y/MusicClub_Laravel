<?php

namespace Database\Seeders;

use App\Models\ClassMember;
use Illuminate\Database\Seeder;

class ClassMemberSeeder extends Seeder
{
    public function run(): void
    {
        // Assign trainees to classes
        for ($classId = 1; $classId <= 7; $classId++) {
            for ($userId = 6; $userId <= 15; $userId++) {
                ClassMember::create([
                    'class_id' => $classId,
                    'user_id' => $userId,
                    'role' => 'trainee',
                ]);
            }
        }

        // Assign trainers to classes
        ClassMember::create([
            'class_id' => 1,
            'user_id' => 4,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 2,
            'user_id' => 4,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 3,
            'user_id' => 5,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 4,
            'user_id' => 5,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 5,
            'user_id' => 4,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 6,
            'user_id' => 5,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 7,
            'user_id' => 4,
            'role' => 'trainer',
        ]);
    }
}
