<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected Role $adminRole;
    protected Role $memberRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles
        $this->adminRole = Role::create(['role_name' => 'Admin', 'description' => 'Administrator']);
        $this->memberRole = Role::create(['role_name' => 'Member', 'description' => 'Regular member']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $password = 'password123';
        $user = User::create([
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '1234567890',
            'password' => bcrypt($password),
            'role_id' => $this->adminRole->id,
            'status' => 'active'
        ]);

        // Verify password was hashed correctly
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check($password, $user->password));

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => $password,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'user',
                    'token'
                ]
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_inactive_user_cannot_access_api(): void
    {
        $user = User::factory()->create([
            'status' => 'inactive',
            'role_id' => $this->adminRole->id
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/users');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Your account is not active. Please contact the administrator.'
            ]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create(['role_id' => $this->adminRole->id, 'status' => 'active']);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/logout');

        $response->assertStatus(200);
    }
}
