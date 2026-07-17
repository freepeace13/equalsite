<?php

use App\Actions\Audit\CreateAudit;
use App\Contracts\Spider;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Models\User;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

/**
 * These call CreateAudit directly rather than through POST /audit, bypassing
 * AuditPolicy::create() on purpose. AuditPolicy's free-tier site-cap check
 * (distinct owned domains < cap) doesn't exclude the domain being resubmitted,
 * so a free account that already owns its one site gets denied at the policy
 * layer on every further submission — including legitimate re-scans of that
 * same site — before CreateAudit::assertRescanAllowed() would ever run. See
 * tests/Feature/Audit/StoreControllerTest.php for that interaction and the
 * project report for why it's flagged as a gap. This file verifies the
 * re-scan-frequency rule itself, in isolation, since it's unreachable via the
 * real HTTP route for a free account past its first audit.
 */
test('a free account is blocked from re-scanning the same domain inside the 24h window', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(RescanTooSoonException::class);
});

test('the re-scan exception carries the timestamp the next scan becomes available', function () {
    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subHours(2)])->save();

    $action = new CreateAudit(Mockery::mock(Spider::class));

    try {
        $action->create($user, 'https://acme.com');
        test()->fail('Expected RescanTooSoonException to be thrown.');
    } catch (RescanTooSoonException $e) {
        expect($e->availableAt->isFuture())->toBeTrue()
            ->and($e->availableAt->diffInHours(now()))->toBeLessThanOrEqual(22);
    }
});

test('a free account is allowed to re-scan again once the 24h window has elapsed', function () {
    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subHours(25)])->save();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-scan']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('second-scan');
});

test('a pro account is never blocked by the re-scan frequency rule', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-scan']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('second-scan');
});
