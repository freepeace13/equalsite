<?php

use App\Contracts\Spider;
use App\Models\Audit;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

/**
 * Completes the most recently created audit for the user and backdates it
 * past the 24h re-scan window, so the next submission to the same domain is
 * blocked by neither the "1 in-flight audit" policy check nor the re-scan
 * rule — only the submission rate limit itself is left to trip.
 */
function completeLatestAudit(User $user): void
{
    Audit::where('user_id', $user->id)->latest('id')->first()->forceFill([
        'status' => Status::Completed,
        'created_at' => now()->subHours(30),
    ])->save();
}

test('free accounts are throttled after 5 audit submissions in an hour', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->times(5)
        ->andReturnUsing(fn () => ['id' => (string) Str::uuid()]);

    for ($i = 0; $i < 5; $i++) {
        $response = $this->post(route('audit.store'), ['url' => 'https://example.com']);
        expect($response->status())->not->toBe(429);
        completeLatestAudit($user);
    }

    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertTooManyRequests();
});

test('pro accounts are throttled after 20 audit submissions in an hour', function () {
    $user = User::factory()->pro()->create();
    $this->actingAs($user);

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->times(20)
        ->andReturnUsing(fn () => ['id' => (string) Str::uuid()]);

    for ($i = 0; $i < 20; $i++) {
        $response = $this->post(route('audit.store'), ['url' => 'https://example.com']);
        expect($response->status())->not->toBe(429);
        completeLatestAudit($user);
    }

    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertTooManyRequests();
});

/**
 * The audit-submission limiter's ->after() callback only fires once the
 * request completes normally. AuditCreateRequest's authorize() throws an
 * AuthorizationException before that point, so a request denied by the "1
 * in-flight audit" policy check should never consume quota — regardless of
 * how many times it's retried.
 */
test('requests denied by authorization do not count toward the submission rate limit', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andReturn(['id' => 'crawler-in-flight-holder']);

    $this->post(route('audit.store'), ['url' => 'https://acme.com'])
        ->assertRedirect(route('audit.progress', ['id' => 'crawler-in-flight-holder']));

    // Far more than the free plan's 5/hour cap — if any of these counted,
    // the account would already be throttled by the time we check below.
    for ($i = 0; $i < 10; $i++) {
        $this->post(route('audit.store'), ['url' => 'https://acme.com'])
            ->assertForbidden();
    }

    completeLatestAudit($user);

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andReturn(['id' => 'crawler-after-denials']);

    $this->post(route('audit.store'), ['url' => 'https://acme.com'])
        ->assertRedirect(route('audit.progress', ['id' => 'crawler-after-denials']));
});

/**
 * Same guarantee as above, but for AuditCreateRequest's rules() failing
 * (ValidationException) rather than authorize() — a mistyped URL shouldn't
 * burn quota either.
 */
test('validation failures do not count toward the submission rate limit', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    for ($i = 0; $i < 10; $i++) {
        $this->post(route('audit.store'), ['url' => 'not-a-valid-url'])
            ->assertSessionHasErrors('url');
    }

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andReturn(['id' => 'crawler-after-validation-failures']);

    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertRedirect(route('audit.progress', ['id' => 'crawler-after-validation-failures']));
});
