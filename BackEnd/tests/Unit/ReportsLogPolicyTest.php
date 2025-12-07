<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Role;
use App\Models\ReportsLog;
use App\Policies\ReportsLogPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportsLogPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected ReportsLogPolicy $policy;
    protected User $admin;
    protected User $leader;
    protected User $member;
    protected ReportsLog $log;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new ReportsLogPolicy();

        // Create roles
        Role::create(['role_name' => 'Admin', 'description' => 'Administrator']);
        Role::create(['role_name' => 'Leader', 'description' => 'Leader']);
        Role::create(['role_name' => 'Member', 'description' => 'Member']);

        // Create users
        $this->admin = User::factory()->create(['role_id' => 1, 'status' => 'active']);
        $this->leader = User::factory()->create(['role_id' => 2, 'status' => 'active']);
        $this->member = User::factory()->create(['role_id' => 3, 'status' => 'active']);

        // Create log
        $this->log = ReportsLog::create([
            'created_by' => $this->member->id,
            'type' => 'Test Log',
            'created_at_report' => now()
        ]);
    }

    public function test_all_users_can_view_any_logs(): void
    {
        $this->assertTrue($this->policy->viewAny($this->admin));
        $this->assertTrue($this->policy->viewAny($this->leader));
        $this->assertTrue($this->policy->viewAny($this->member));
    }

    public function test_admin_can_view_all_logs(): void
    {
        $this->assertTrue($this->policy->view($this->admin, $this->log));
    }

    public function test_leader_can_view_all_logs(): void
    {
        $this->assertTrue($this->policy->view($this->leader, $this->log));
    }

    public function test_member_can_view_own_log(): void
    {
        $this->assertTrue($this->policy->view($this->member, $this->log));
    }

    public function test_member_cannot_view_others_log(): void
    {
        $otherLog = ReportsLog::create([
            'created_by' => $this->admin->id,
            'type' => 'Admin Log',
            'created_at_report' => now()
        ]);

        $this->assertFalse($this->policy->view($this->member, $otherLog));
    }

    public function test_only_admin_and_leader_can_create_logs(): void
    {
        $this->assertTrue($this->policy->create($this->admin));
        $this->assertTrue($this->policy->create($this->leader));
        $this->assertFalse($this->policy->create($this->member));
    }

    public function test_only_admin_and_leader_can_update_logs(): void
    {
        $this->assertTrue($this->policy->update($this->admin, $this->log));
        $this->assertTrue($this->policy->update($this->leader, $this->log));
        $this->assertFalse($this->policy->update($this->member, $this->log));
    }

    public function test_only_admin_and_leader_can_delete_logs(): void
    {
        $this->assertTrue($this->policy->delete($this->admin, $this->log));
        $this->assertTrue($this->policy->delete($this->leader, $this->log));
        $this->assertFalse($this->policy->delete($this->member, $this->log));
    }
}
