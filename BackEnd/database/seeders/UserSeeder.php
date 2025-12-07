<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::create([
            'full_name' => 'Admin User',
            'email' => 'admin@musicclub.com',
            'phone' => '555-0001',
            'role_id' => 1,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Manager users
        User::create([
            'full_name' => 'John Manager',
            'email' => 'john.manager@musicclub.com',
            'phone' => '555-0002',
            'role_id' => 2,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'full_name' => 'Sarah Manager',
            'email' => 'sarah.manager@musicclub.com',
            'phone' => '555-0003',
            'role_id' => 2,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Trainer users
        User::create([
            'full_name' => 'Mike Trainer',
            'email' => 'mike.trainer@musicclub.com',
            'phone' => '555-0004',
            'role_id' => 3,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'full_name' => 'Emma Trainer',
            'email' => 'emma.trainer@musicclub.com',
            'phone' => '555-0005',
            'role_id' => 3,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Trainee users
        for ($i = 1; $i <= 10; $i++) {
            User::create([
                'full_name' => "Trainee User $i",
                'email' => "trainee$i@musicclub.com",
                'phone' => '555-001' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'role_id' => 4,
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }

        // Member users
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'full_name' => "Member User $i",
                'email' => "member$i@musicclub.com",
                'phone' => '555-002' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'role_id' => 5,
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }
    }
}
