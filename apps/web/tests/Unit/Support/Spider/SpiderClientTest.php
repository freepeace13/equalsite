<?php

use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use App\Support\Spider\SpiderClient;
use App\Support\Spider\SpiderOptions;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

function spiderOptions(): SpiderOptions
{
    return SpiderOptions::make('https://example.com');
}

test('create returns the decoded response on success', function () {
    Http::fake([
        '*/api/v1/audit' => Http::response(['id' => 'crawler-123'], 202),
    ]);

    $result = (new SpiderClient)->create(spiderOptions());

    expect($result)->toBe(['id' => 'crawler-123']);
});

test('create throws a validation exception when the crawler rejects the request as malformed', function () {
    Http::fake([
        '*/api/v1/audit' => Http::response([
            'error' => 'Invalid request body',
            'message' => 'The request failed validation.',
            'errors' => [
                ['field' => 'options.maxPages', 'message' => 'options.maxPages is required and must be a positive integer.'],
            ],
        ], 400),
    ]);

    try {
        (new SpiderClient)->create(spiderOptions());
        $this->fail('Expected SpiderValidationException to be thrown.');
    } catch (SpiderValidationException $e) {
        expect($e->getMessage())->toBe('The request failed validation.')
            ->and($e->errors)->toBe([
                ['field' => 'options.maxPages', 'message' => 'options.maxPages is required and must be a positive integer.'],
            ]);
    }
});

test('create throws an unavailable exception on a non-validation error response', function () {
    Http::fake([
        '*/api/v1/audit' => Http::response('Internal Server Error', 500),
    ]);

    try {
        (new SpiderClient)->create(spiderOptions());
        $this->fail('Expected SpiderUnavailableException to be thrown.');
    } catch (SpiderUnavailableException $e) {
        expect($e->status)->toBe(500);
    }
});

test('healthcheck returns the decoded response on success', function () {
    Http::fake([
        '*/api/v1/healthcheck' => Http::response(['ok' => true], 200),
    ]);

    $result = (new SpiderClient)->healthcheck();

    expect($result)->toBe(['ok' => true]);
});

test('healthcheck throws an unavailable exception when the crawler-api reports itself unhealthy', function () {
    Http::fake([
        '*/api/v1/healthcheck' => Http::response(['ok' => false], 503),
    ]);

    try {
        (new SpiderClient)->healthcheck();
        $this->fail('Expected SpiderUnavailableException to be thrown.');
    } catch (SpiderUnavailableException $e) {
        expect($e->status)->toBe(503);
    }
});

test('cancel throws an unavailable exception when the crawler-api cannot be reached', function () {
    Http::fake([
        '*/api/v1/audit/*' => Http::failedConnection(),
    ]);

    try {
        (new SpiderClient)->cancel('crawler-123');
        $this->fail('Expected SpiderUnavailableException to be thrown.');
    } catch (SpiderUnavailableException $e) {
        expect($e->status)->toBeNull();
    }
});
