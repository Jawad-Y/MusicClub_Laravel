<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Policies will be auto-discovered based on namespace conventions
        // You can also manually map them here if needed:
        // \App\Models\User::class => \App\Policies\UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Auto-discover policies
        // Laravel will automatically discover policies following the convention:
        // Model: App\Models\ModelName
        // Policy: App\Policies\ModelNamePolicy
    }
}
