<?php

it('reads the Sentry DSN from SENTRY_LARAVEL_DSN', function () {
    config(['sentry.dsn' => 'https://example@o0.ingest.sentry.io/1']);

    expect(config('sentry.dsn'))->toBe('https://example@o0.ingest.sentry.io/1');
});

it('defaults the Sentry environment to the app environment when SENTRY_ENVIRONMENT is unset', function () {
    expect(config('sentry.environment'))->toBe(config('app.env'));
});

it('has no DSN configured out of the box in this test environment', function () {
    expect(config('sentry.dsn'))->toBeNull();
});
