<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClassLeaderSeeder extends Seeder
{
    public function run(): void
    {
        $classLeaders = [
            [
                'full_name' => 'Leader One',
                'email' => 'leader1.classleader@musicclub.com',
                'phone' => '555-00301',
                'role_id' => 4,
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
            [
                'full_name' => 'Leader Two',
                'email' => 'leader2.classleader@musicclub.com',
                'phone' => '555-00302',
                'role_id' => 4,
                'status' => 'active',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($classLeaders as $leader) {
            
            User::firstOrCreate(
                ['email' => $leader['email']],
                $leader
            );
        }
    }
}
