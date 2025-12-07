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
            'full_name' => 'John leader',
            'email' => 'john.leader@musicclub.com',
            'phone' => '555-0002',
            'role_id' => 2,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'full_name' => 'Sarah dep',
            'email' => 'sarah.dep@musicclub.com',
            'phone' => '555-0003',
            'role_id' => 3,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Trainer users
        User::create([
            'full_name' => 'Mike dep',
            'email' => 'mike.dep@musicclub.com',
            'phone' => '555-0004',
            'role_id' => 3,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        User::create([
            'full_name' => 'Emma class',
            'email' => 'emma.classleader@musicclub.com',
            'phone' => '555-0005',
            'role_id' => 4,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);
                User::create([
            'full_name' => 'inventory',
            'email' => 'emma2.inv@musicclub.com',
            'phone' => '555-0025',
            'role_id' => 5,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]); 
       User::create([
            'full_name' => 'Affair',
            'email' => 'emma2.aff@musicclub.com',
            'phone' => '555-0025',
            'role_id' => 6,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

                User::create([
            'full_name' => 'Emma trainer',
            'email' => 'emma.trainer@musicclub.com',
            'phone' => '555-0005',
            'role_id' => 7,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);
                User::create([
            'full_name' => 'Emma2 trainer',
            'email' => 'emma2.trainer@musicclub.com',
            'phone' => '555-0025',
            'role_id' => 7,
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        // Trainee users
        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'full_name' => "Trainee User $i",
                'email' => "trainee$i@musicclub.com",
                'phone' => '555-001' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'role_id' => 8,
                'status' => 'active',
                'password' => Hash::make('password'),
            ]);
        }

        
        
    }
}
