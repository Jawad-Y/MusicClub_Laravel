<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            [
                'role_name' => 'leader',
                'description' => 'Main system leader',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'department leader',
                'description' => 'Department manager',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'class leader',
                'description' => 'Responsible for classes',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'inventory leader',
                'description' => 'Responsible for inventory management',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'individual affair',
                'description' => 'HR / Affairs manager',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'trainer',
                'description' => 'Trainer user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_name' => 'trainee',
                'description' => 'Trainee user',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}