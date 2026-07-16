<?php

use App\Contracts\Spider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * The throttle:audit-submission middleware runs before AuditCreateRequest's
 * authorize()/rules(), so it counts every request that hits the route — even
 * ones the policy or validation would otherwise reject downstream. Only the
 * very first request here can possibly reach CreateAudit (every later one is
 * denied by the "1 in-flight audit" policy check instead), so the spider
 * fake only ever needs to tolerate a single call.
 */
test('free accounts are throttled after 5 audit submissions in an hour', function () {
    $user = User::factory()->create();

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->atMost()->once()
        ->andReturn(['id' => 'crawler-rate-limit-free']);

    $this->actingAs($user);

    for ($i = 0; $i < 5; $i++) {
        $response = $this->post(route('audit.store'), ['url' => 'https://example.com']);
        expect($response->status())->not->toBe(429);
    }

    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertTooManyRequests();
});

test('pro accounts are throttled after 20 audit submissions in an hour', function () {
    $user = User::factory()->pro()->create();

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->atMost()->once()
        ->andReturn(['id' => 'crawler-rate-limit-pro']);

    $this->actingAs($user);

    for ($i = 0; $i < 20; $i++) {
        $response = $this->post(route('audit.store'), ['url' => 'https://example.com']);
        expect($response->status())->not->toBe(429);
    }

    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertTooManyRequests();
});
