<?php

use App\Actions\Audit\CancelAudit;
use App\Contracts\Spider;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('cancel marks a queued audit cancelled and tells the spider to cancel it', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-cancel-1', 'acme.com', Status::Queued);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('cancel')->once()->with('crawler-cancel-1');

    (new CancelAudit($spider))->cancel($audit);

    $fresh = $audit->fresh();
    expect($fresh->status)->toBe(Status::Cancelled)
        ->and($fresh->cancelled_at)->not->toBeNull();
});

test('cancel is a no-op for an audit that is not cancellable', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-cancel-2', 'acme.com', Status::Completed);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldNotReceive('cancel');

    (new CancelAudit($spider))->cancel($audit);

    expect($audit->fresh()->status)->toBe(Status::Completed);
});
