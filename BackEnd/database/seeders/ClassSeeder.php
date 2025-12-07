<?php

namespace Database\Seeders;

use App\Models\Clas;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    public function run(): void
    {
        Clas::create([
            'class_name' => 'Beginners Violin',
            'department_id' => 1,
            'class_leader_id' => 4,
        ]);

        Clas::create([
            'class_name' => 'Intermediate Violin',
            'department_id' => 1,
            'class_leader_id' => 4,
        ]);

        Clas::create([
            'class_name' => 'Beginners Flute',
            'department_id' => 2,
            'class_leader_id' => 5,
        ]);

        Clas::create([
            'class_name' => 'Intermediate Flute',
            'department_id' => 2,
            'class_leader_id' => 5,
        ]);

        Clas::create([
            'class_name' => 'Drum Basics',
            'department_id' => 3,
            'class_leader_id' => 4,
        ]);

        Clas::create([
            'class_name' => 'Vocal Training',
            'department_id' => 4,
            'class_leader_id' => 5,
        ]);

        Clas::create([
            'class_name' => 'Music Theory 101',
            'department_id' => 5,
            'class_leader_id' => 4,
        ]);
    }
}
