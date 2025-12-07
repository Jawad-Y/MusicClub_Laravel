<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentAccessTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $departmentLeader;
    protected User $member;
    protected Department $department;
    protected Role $adminRole;
    protected Role $departmentLeaderRole;
    protected Role $memberRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->adminRole = Role::create(['role_name' => 'Admin', 'description' => 'Administrator']);
        $this->departmentLeaderRole = Role::create(['role_name' => 'Department Leader', 'description' => 'Department Leader']);
        $this->memberRole = Role::create(['role_name' => 'Member', 'description' => 'Regular member']);

        // Create users
        $this->admin = User::factory()->create([
            'role_id' => $this->adminRole->id,
            'status' => 'active'
        ]);

        $this->departmentLeader = User::factory()->create([
            'role_id' => $this->departmentLeaderRole->id,
            'status' => 'active'
        ]);

        $this->member = User::factory()->create([
            'role_id' => $this->memberRole->id,
            'status' => 'active'
        ]);

        // Create department
        $this->department = Department::create([
            'department_name' => 'Strings',
            'leader_id' => $this->departmentLeader->id
        ]);
    }

    public function test_admin_can_access_all_departments(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/departments');

        $response->assertStatus(200);
    }

    public function test_department_leader_can_access_their_department(): void
    {
        $response = $this->actingAs($this->departmentLeader, 'sanctum')
            ->getJson('/api/departments/' . $this->department->id);

        $response->assertStatus(200);
    }

    public function test_regular_member_cannot_access_departments(): void
    {
        $response = $this->actingAs($this->member, 'sanctum')
            ->getJson('/api/departments/' . $this->department->id);

        $response->assertStatus(403);
    }

    public function test_department_leader_cannot_access_other_departments(): void
    {
        $otherDepartment = Department::create([
            'department_name' => 'Brass',
            'leader_id' => $this->admin->id
        ]);

        $response = $this->actingAs($this->departmentLeader, 'sanctum')
            ->getJson('/api/departments/' . $otherDepartment->id);

        $response->assertStatus(403);
    }
}
