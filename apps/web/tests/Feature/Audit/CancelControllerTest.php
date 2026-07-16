<?php

use App\Contracts\Spider;
use App\Models\Audit;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// user_id is required (NOT NULL) since the monetization migration — every
// audit now belongs to an account, so the helper takes the owning User
// explicitly rather than omitting user_id like it used to.
function makeAudit(User $user, string $crawlerId, Status $status): Audit
{
    return Audit::create([
        'user_id' => $user->id,
        'crawler_id' => $crawlerId,
        'url' => 'https://example.com',
        'domain' => 'example.com',
        'status' => $status,
    ]);
}

test('guests are redirected to login', function () {
    $this->delete(route('audit.cancel', ['id' => 'does-not-exist']))
        ->assertRedirect(route('login'));
});

test('cancelling a queued audit tells the spider to cancel and marks it cancelled', function () {
    $user = User::factory()->create();
    $audit = makeAudit($user, 'crawler-queued', Status::Queued);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->once()
        ->with('crawler-queued');

    $response = $this->actingAs($user)->delete(route('audit.cancel', ['id' => 'crawler-queued']));

    $response->assertRedirect();

    $audit->refresh();
    expect($audit->status)->toBe(Status::Cancelled);
    expect($audit->cancelled_at)->not->toBeNull();
});

test('cancelling a started audit tells the spider to cancel and marks it cancelled', function () {
    $user = User::factory()->create();
    $audit = makeAudit($user, 'crawler-started', Status::Started);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->once()
        ->with('crawler-started');

    $this->actingAs($user)->delete(route('audit.cancel', ['id' => 'crawler-started']));

    $audit->refresh();
    expect($audit->status)->toBe(Status::Cancelled);
});

test('cancelling an already-completed audit is a no-op and does not touch the spider', function () {
    $user = User::factory()->create();
    $audit = makeAudit($user, 'crawler-completed', Status::Completed);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->never();

    $this->actingAs($user)->delete(route('audit.cancel', ['id' => 'crawler-completed']));

    $audit->refresh();
    expect($audit->status)->toBe(Status::Completed);
    expect($audit->cancelled_at)->toBeNull();
});

test('cancelling an unknown audit id 404s', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->delete(route('audit.cancel', ['id' => 'does-not-exist']))
        ->assertNotFound();
});
