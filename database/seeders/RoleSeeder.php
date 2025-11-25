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
            'role_name' => 'Manager',
            'description' => 'Manager with departmental access',
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
