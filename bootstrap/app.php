<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'user.active' => \App\Http\Middleware\ValidateUserStatus::class,
            'department.access' => \App\Http\Middleware\CheckDepartmentAccess::class,
            'class.access' => \App\Http\Middleware\CheckClassAccess::class,
            'resource.owner' => \App\Http\Middleware\CheckResourceOwnership::class,
        ]);

        // Apply middleware to API routes
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Apply user status validation to all routes (skips if not authenticated)
        $middleware->append(\App\Http\Middleware\ValidateUserStatus::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
