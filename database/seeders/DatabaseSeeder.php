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
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
            ClassSeeder::class,
            ClassMemberSeeder::class,
            InstrumentTypeSeeder::class,
            InstrumentSeeder::class,
            ClothingItemSeeder::class,
            InstrumentAssignmentSeeder::class,
            ClothingAssignmentSeeder::class,
            TrainingSessionSeeder::class,
            SessionAttendanceSeeder::class,
            HomeworkSeeder::class,
            HomeworkSubmissionSeeder::class,
            PerformanceReviewSeeder::class,
            InstrumentMaintenanceSeeder::class,
            EventSeeder::class,
            EventParticipantSeeder::class,
            MembershipSeeder::class,
            LibraryMaterialSeeder::class,
            ReportsLogSeeder::class,
            UserAssignmentSeeder::class,
        ]);
    }
}
