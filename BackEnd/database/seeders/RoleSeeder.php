<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'role_name' => 'Admin',
            'description' => 'Administrator with full system access',
        ]);

        Role::create([
            'role_name' => 'Leader',
            'description' => 'Main system leader',
        ]);

        Role::create([
            'role_name' => 'Department Leader',
            'description' => 'Department manager',
        ]);

        Role::create([
            'role_name' => 'Class Leader',
            'description' => 'Responsible for classes',
        ]);

        Role::create([
            'role_name' => 'Inventory Manager',
            'description' => 'Responsible for inventory management',
        ]);

        Role::create([
            'role_name' => 'Individual Affair',
            'description' => 'HR / Affairs manager',
        ]);

        Role::create([
            'role_name' => 'Trainer',
            'description' => 'Training session instructor',
        ]);

        Role::create([
            'role_name' => 'Trainee',
            'description' => 'Training session participant',
        ]);

        Role::create([
            'role_name' => 'Member',
            'description' => 'Club member',
        ]);
    }
}
