<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AuditArtifactsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (config('filesystems.disks.audit_artifacts.driver') !== 'local') {
            return;
        }

        Storage::disk('audit_artifacts')->buildTemporaryUrlsUsing(
            fn (string $path, \DateTimeInterface $expiration) => URL::temporarySignedRoute(
                'audit-artifacts.show',
                $expiration,
                ['path' => $path]
            )
        );
    }
}
