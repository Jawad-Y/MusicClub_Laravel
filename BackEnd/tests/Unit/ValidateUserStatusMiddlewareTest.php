<?php

namespace Tests\Unit;

use App\Http\Middleware\ValidateUserStatus;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ValidateUserStatusMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Role::create(['role_name' => 'Member', 'description' => 'Member']);
    }

    public function test_allows_active_user(): void
    {
        $user = User::factory()->create([
            'role_id' => 1,
            'status' => 'active'
        ]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new ValidateUserStatus();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->status());
    }

    public function test_blocks_inactive_user(): void
    {
        $user = User::factory()->create([
            'role_id' => 1,
            'status' => 'inactive'
        ]);

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new ValidateUserStatus();
        
        $response = $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->status());
        $this->assertStringContainsString('not active', $response->getContent());
    }

    public function test_revokes_tokens_for_inactive_user(): void
    {
        $user = User::factory()->create([
            'role_id' => 1,
            'status' => 'inactive'
        ]);

        $token = $user->createToken('test-token');

        $request = Request::create('/api/test', 'GET');
        $request->setUserResolver(fn() => $user);

        $middleware = new ValidateUserStatus();
        
        $middleware->handle($request, function () {
            return response()->json(['success' => true]);
        });

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id
        ]);
    }
}
