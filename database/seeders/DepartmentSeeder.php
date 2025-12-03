<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        Department::create([
            'department_name' => 'String Instruments',
            'leader_id' => 2,
        ]);

        Department::create([
            'department_name' => 'Wind Instruments',
            'leader_id' => 3,
        ]);

        Department::create([
            'department_name' => 'Percussion',
            'leader_id' => 2,
        ]);

        Department::create([
            'department_name' => 'Vocal',
            'leader_id' => 3,
        ]);

        Department::create([
            'department_name' => 'Music Theory',
            'leader_id' => 2,
        ]);
    }
}
