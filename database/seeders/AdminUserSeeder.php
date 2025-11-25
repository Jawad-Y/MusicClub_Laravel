<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $leaderRoleId = Role::where('role_name', 'leader')->value('id');

        if (!$leaderRoleId) {
            $leaderRoleId = Role::create([
                'role_name'   => 'leader',
                'description' => 'Main system leader',
            ])->id;
        }

        User::updateOrCreate(
            ['email' => 'leader@example.com'],
            [
                'full_name' => 'System Leader',
                'phone'     => '0000000000',
                'role_id'   => $leaderRoleId,
                'status'    => 'active',
                'password'  => Hash::make('password'),
            ]
        );
    }
}
