<?php

return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    'environment' => env('SENTRY_ENVIRONMENT', config('app.env')),

    // Errors only — no performance tracing in this pass.
    'traces_sample_rate' => null,
];
