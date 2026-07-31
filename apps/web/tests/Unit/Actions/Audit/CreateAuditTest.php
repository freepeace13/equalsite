<?php

use App\Actions\Audit\CreateAudit;
use App\Contracts\Spider;
use App\Exceptions\Audit\AuditInProgressException;
use App\Exceptions\Audit\DomainBlockedException;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Exceptions\Audit\SiteCapExceededException;
use App\Models\DomainBlock;
use App\Models\User;
use App\Support\Plan\PlanLimits;
use App\Value\CrawlDepth;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

/**
 * These call CreateAudit directly rather than through POST /audit, bypassing
 * AuditPolicy::create() (which only enforces the one-audit-in-flight rule).
 * See tests/Feature/Audit/StoreControllerTest.php for the full HTTP-level
 * interaction between the policy and these action-level rules.
 */
test('a free account is blocked from re-scanning the same domain inside the 1hr window', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(RescanTooSoonException::class);
});

test('the re-scan exception carries the timestamp the next scan becomes available', function () {
    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subMinutes(2)])->save();

    $action = new CreateAudit(Mockery::mock(Spider::class));

    try {
        $action->create($user, 'https://acme.com');
        test()->fail('Expected RescanTooSoonException to be thrown.');
    } catch (RescanTooSoonException $e) {
        expect($e->availableAt->isFuture())->toBeTrue()
            ->and($e->availableAt->diffInMinutes(now()))->toBeLessThanOrEqual(58);
    }
});

test('a free account is blocked from re-scanning a domain that already has an active audit', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Started);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(AuditInProgressException::class);
});

test('a pro account is blocked from re-scanning a domain that already has an active audit', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Queued);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(AuditInProgressException::class);
});

test('a free account is allowed to re-scan again once the 1h window has elapsed', function () {
    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subHours(2)])->save();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-scan']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('second-scan');
});

test('a pro account is also blocked from re-scanning the same domain inside the rescan window', function () {
    // page_cap/crawl_depths/rescan_frequency_minutes come from config/spider.php
    // for every plan — the rescan cap is not a monetization lever.
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(RescanTooSoonException::class);
});

test('a free account adding a genuinely new site beyond its site cap is blocked with an upgrade message', function () {
    $user = User::factory()->create();
    makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);

    $action = new CreateAudit(Mockery::mock(Spider::class));

    try {
        $action->create($user, 'https://example.org');
        test()->fail('Expected SiteCapExceededException to be thrown.');
    } catch (SiteCapExceededException $e) {
        expect($e->siteCap)->toBe(1)
            ->and($e->getMessage())->toContain('Upgrade to Pro');
    }
});

test('a free account resubmitting its own existing site never counts against the site cap', function () {
    $user = User::factory()->create();
    $firstAudit = makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);
    $firstAudit->forceFill(['created_at' => now()->subHours(2)])->save(); // clear of the rescan window

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-scan']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('second-scan');
});

test('a pro account is never blocked by the site cap regardless of how many sites it already owns', function () {
    $user = User::factory()->pro()->create();
    makeUserAudit($user, 'site-1', 'acme.com', Status::Completed);
    makeUserAudit($user, 'site-2', 'beta.com', Status::Completed);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'third-site']);

    $audit = (new CreateAudit($spider))->create($user, 'https://gamma.com');

    expect($audit->crawler_id)->toBe('third-site');
});

test('a free account bypasses the site cap when monetization is disabled', function () {
    config(['plans.enabled' => false]);

    $user = User::factory()->create();
    makeUserAudit($user, 'first-site', 'acme.com', Status::Completed);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'second-site']);

    $action = new CreateAudit($spider);
    $audit = $action->create($user, 'https://example.org'); // a genuinely new site, would exceed the free site cap

    expect($audit->crawler_id)->toBe('second-site');
});

test('disabling monetization does not bypass the re-scan frequency, since it is not plan-driven', function () {
    config(['plans.enabled' => false]);

    $user = User::factory()->create();
    $lastAudit = makeUserAudit($user, 'first-scan', 'acme.com', Status::Completed);
    $lastAudit->forceFill(['created_at' => now()->subMinutes(2)])->save(); // inside the spider-config rescan window

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://acme.com'))
        ->toThrow(RescanTooSoonException::class);
});

test('an account is blocked from scanning a domain on the block list', function () {
    DomainBlock::create(['domain' => 'blocked-example.com']);
    $user = User::factory()->create();

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://blocked-example.com'))
        ->toThrow(DomainBlockedException::class);
});

test('a pro account is also blocked from scanning a domain on the block list', function () {
    DomainBlock::create(['domain' => 'blocked-example.com']);
    $user = User::factory()->pro()->create();

    $action = new CreateAudit(Mockery::mock(Spider::class));

    expect(fn () => $action->create($user, 'https://blocked-example.com'))
        ->toThrow(DomainBlockedException::class);
});

test('a domain that is not on the block list is unaffected', function () {
    DomainBlock::create(['domain' => 'blocked-example.com']);
    $user = User::factory()->create();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')->once()->andReturn(['id' => 'not-blocked']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('not-blocked');
});

test('captureScreenshot is always sent as false regardless of plan', function () {
    $user = User::factory()->create();

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')
        ->once()
        ->withArgs(fn ($options) => $options->toArray()['options']['captureScreenshot'] === false)
        ->andReturn(['id' => 'capture-screenshot-check']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com');

    expect($audit->crawler_id)->toBe('capture-screenshot-check');
});

test('the spider request parameters are stored on the audit as custom_data.request_params', function () {
    $user = User::factory()->create();
    $limits = PlanLimits::for($user->plan);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('create')
        ->once()
        ->andReturn(['id' => 'request-params-check']);

    $audit = (new CreateAudit($spider))->create($user, 'https://acme.com', ['crawlDepth' => CrawlDepth::Deep->value]);

    expect($audit->getCustomData('request_params'))->toEqual([
        'urls' => ['https://acme.com'],
        'options' => [
            'maxPages' => $limits->pageCap(),
            'enqueueLinks' => true,
            'enqueueStrategy' => 'same-domain',
            'maxDepth' => $limits->clampCrawlDepth(CrawlDepth::Deep)->value,
            'includeGlobs' => [],
            'excludeGlobs' => [],
            'captureScreenshot' => false,
        ],
    ]);
});
