<?php

use App\Contracts\Spider;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeAudit(string $crawlerId, Status $status): Audit
{
    return Audit::create([
        'crawler_id' => $crawlerId,
        'url' => 'https://example.com',
        'domain' => 'example.com',
        'status' => $status,
    ]);
}

test('cancelling a queued audit tells the spider to cancel and marks it cancelled', function () {
    $audit = makeAudit('crawler-queued', Status::Queued);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->once()
        ->with('crawler-queued');

    $response = $this->delete(route('audit.cancel', ['id' => 'crawler-queued']));

    $response->assertRedirect();

    $audit->refresh();
    expect($audit->status)->toBe(Status::Cancelled);
    expect($audit->cancelled_at)->not->toBeNull();
});

test('cancelling a started audit tells the spider to cancel and marks it cancelled', function () {
    $audit = makeAudit('crawler-started', Status::Started);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->once()
        ->with('crawler-started');

    $this->delete(route('audit.cancel', ['id' => 'crawler-started']));

    $audit->refresh();
    expect($audit->status)->toBe(Status::Cancelled);
});

test('cancelling an already-completed audit is a no-op and does not touch the spider', function () {
    $audit = makeAudit('crawler-completed', Status::Completed);

    test()->mock(Spider::class)
        ->shouldReceive('cancel')
        ->never();

    $this->delete(route('audit.cancel', ['id' => 'crawler-completed']));

    $audit->refresh();
    expect($audit->status)->toBe(Status::Completed);
    expect($audit->cancelled_at)->toBeNull();
});

test('cancelling an unknown audit id 404s', function () {
    $this->delete(route('audit.cancel', ['id' => 'does-not-exist']))
        ->assertNotFound();
});
