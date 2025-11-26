<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $member;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminRole = Role::create(['role_name' => 'Admin', 'description' => 'Administrator']);
        $memberRole = Role::create(['role_name' => 'Member', 'description' => 'Regular member']);

        // Create users
        $this->admin = User::factory()->create([
            'role_id' => $adminRole->id,
            'status' => 'active'
        ]);
        
        $this->member = User::factory()->create([
            'role_id' => $memberRole->id,
            'status' => 'active'
        ]);
    }

    public function test_can_list_users(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
    }

    public function test_admin_can_create_user(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
            'full_name' => 'New User',
            'email' => 'newuser@example.com',
            'phone' => '1234567890',
            'role_id' => 2,
            'status' => 'active',
            'password' => 'password123'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com'
        ]);
    }

    public function test_member_cannot_create_user(): void
    {
        $response = $this->actingAs($this->member, 'sanctum')
            ->postJson('/api/users', [
            'full_name' => 'New User',
            'email' => 'newuser@example.com',
            'phone' => '1234567890',
            'role_id' => 2,
            'status' => 'active',
            'password' => 'password123'
        ]);

        $response->assertStatus(403);
    }

    public function test_can_view_specific_user(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/users/' . $this->member->id);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $this->member->id,
                    'email' => $this->member->email
                ]
            ]);
    }

    public function test_admin_can_update_user(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson('/api/users/' . $this->member->id, [
            'full_name' => 'Updated Name',
            'email' => $this->member->email,
            'role_id' => $this->member->role_id,
            'status' => $this->member->status
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $this->member->id,
            'full_name' => 'Updated Name'
        ]);
    }

    public function test_admin_can_delete_user(): void
    {
        $memberRole = Role::where('role_name', 'Member')->first();
        $user = User::factory()->create(['role_id' => $memberRole->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson('/api/users/' . $user->id);

        $response->assertStatus(204);
    }

    public function test_validation_fails_with_invalid_data(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/users', [
            'full_name' => '',
            'email' => 'invalid-email',
            'password' => '123'
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['full_name', 'email', 'password']);
    }
}
