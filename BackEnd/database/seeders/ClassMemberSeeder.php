<?php

namespace Database\Seeders;

use App\Models\ClassMember;
use Illuminate\Database\Seeder;

class ClassMemberSeeder extends Seeder
{
    public function run(): void
    {
        // Assign trainees to classes (users 10-14, which are the actual trainees with role_id 8)
        for ($classId = 1; $classId <= 7; $classId++) {
            for ($userId = 10; $userId <= 14; $userId++) {
                ClassMember::create([
                    'class_id' => $classId,
                    'user_id' => $userId,
                    'role' => 'trainee',
                ]);
            }
        }

        // Assign trainers to classes
        // User 8 - Emma trainer (role_id 7)
        ClassMember::create([
            'class_id' => 1,
            'user_id' => 8,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 2,
            'user_id' => 8,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 5,
            'user_id' => 8,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 7,
            'user_id' => 8,
            'role' => 'trainer',
        ]);

        // User 9 - Emma2 trainer (role_id 7)
        ClassMember::create([
            'class_id' => 3,
            'user_id' => 9,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 4,
            'user_id' => 9,
            'role' => 'trainer',
        ]);

        ClassMember::create([
            'class_id' => 6,
            'user_id' => 9,
            'role' => 'trainer',
        ]);
    }
}
