<?php

namespace Tests\Unit;

use App\Http\Middleware\CheckRole;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class CheckRoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['role_name' => 'Admin', 'description' => 'Administrator']);
        Role::create(['role_name' => 'Member', 'description' => 'Member']);
        Role::create(['role_name' => 'Trainer', 'description' => 'Trainer']);
    }

    public function test_allows_user_with_correct_role(): void
    {
        $user = User::factory()->create([
            'role_id' => 1,
            'status' => 'active'
        ]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new CheckRole();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        }, 'Admin');

        $this->assertEquals(200, $response->status());
    }

    public function test_blocks_user_with_incorrect_role(): void
    {
        $user = User::factory()->create([
            'role_id' => 2, // Member
            'status' => 'active'
        ]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new CheckRole();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        }, 'Admin');

        $this->assertEquals(403, $response->status());
        $this->assertStringContainsString('not allowed', $response->getContent());
    }

    public function test_allows_user_with_one_of_multiple_roles(): void
    {
        $user = User::factory()->create([
            'role_id' => 3, // Trainer
            'status' => 'active'
        ]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new CheckRole();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        }, 'Admin', 'Trainer', 'Leader');

        $this->assertEquals(200, $response->status());
    }

    public function test_blocks_unauthenticated_user(): void
    {
        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => null);

        $middleware = new CheckRole();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        }, 'Admin');

        $this->assertEquals(401, $response->status());
        $this->assertStringContainsString('Authentication required', $response->getContent());
    }
}
