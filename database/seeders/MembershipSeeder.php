<?php

namespace Database\Seeders;

use App\Models\Membership;
use Illuminate\Database\Seeder;

class MembershipSeeder extends Seeder
{
    public function run(): void
    {
        // Create memberships for all users
        for ($userId = 2; $userId <= 20; $userId++) {
            Membership::create([
                'user_id' => $userId,
                'status' => rand(0, 1) ? 'active' : 'inactive',
                'start_date' => now()->subDays(rand(30, 365))->format('Y-m-d'),
                'end_date' => now()->addDays(rand(1, 365))->format('Y-m-d'),
            ]);
        }
    }
}
