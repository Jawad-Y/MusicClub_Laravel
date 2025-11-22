<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1) Create a default role (if not exists)
        $role = Role::firstOrCreate(
            ['role_name' => 'Member'], 
            ['description' => 'Default member role']
        );

        // 2) Create one test user
        User::factory()->create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'role_id' => $role->id,
        ]);
    }
}
