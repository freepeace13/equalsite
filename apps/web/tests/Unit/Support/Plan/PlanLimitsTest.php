<?php

use App\Support\Plan\PlanLimits;
use App\Value\CrawlDepth;
use App\Value\Plan;
use Tests\TestCase;

// Needs the framework booted so config('plans.*') resolves — PlanLimits is
// the single seam over config/plans.php, so these tests pin that contract.
uses(TestCase::class);

test('free plan caps sites to 1', function () {
    expect(PlanLimits::for(Plan::Free)->siteCap())->toBe(1);
});

test('pro plan has no site cap', function () {
    expect(PlanLimits::for(Plan::Pro)->siteCap())->toBeNull();
});

test('free plan caps pages to 50', function () {
    expect(PlanLimits::for(Plan::Free)->pageCap())->toBe(50);
});

test('pro plan caps pages to 100', function () {
    expect(PlanLimits::for(Plan::Pro)->pageCap())->toBe(100);
});

test('free plan only allows shallow crawl depth', function () {
    expect(PlanLimits::for(Plan::Free)->allowedCrawlDepths())->toBe([CrawlDepth::Shallow]);
});

test('pro plan allows every crawl depth', function () {
    expect(PlanLimits::for(Plan::Pro)->allowedCrawlDepths())->toBe([
        CrawlDepth::Shallow,
        CrawlDepth::Standard,
        CrawlDepth::Deep,
    ]);
});

test('free plan clamps any requested depth down to shallow', function (CrawlDepth $requested) {
    expect(PlanLimits::for(Plan::Free)->clampCrawlDepth($requested))->toBe(CrawlDepth::Shallow);
})->with([
    'shallow requested' => CrawlDepth::Shallow,
    'standard requested' => CrawlDepth::Standard,
    'deep requested' => CrawlDepth::Deep,
]);

test('pro plan passes every requested depth through unclamped', function (CrawlDepth $requested) {
    expect(PlanLimits::for(Plan::Pro)->clampCrawlDepth($requested))->toBe($requested);
})->with([
    'shallow requested' => CrawlDepth::Shallow,
    'standard requested' => CrawlDepth::Standard,
    'deep requested' => CrawlDepth::Deep,
]);

test('free plan re-scan frequency is 60 minutes', function () {
    expect(PlanLimits::for(Plan::Free)->rescanFrequencyMinutes())->toBe(60);
});

test('pro plan has no re-scan frequency cap', function () {
    expect(PlanLimits::for(Plan::Pro)->rescanFrequencyMinutes())->toBeNull();
});

test('free plan retains 5 audits of history', function () {
    expect(PlanLimits::for(Plan::Free)->historyRetention())->toBe(5);
});

test('pro plan retains unlimited history', function () {
    expect(PlanLimits::for(Plan::Pro)->historyRetention())->toBeNull();
});

test('free plan queue priority is lower priority than pro', function () {
    expect(PlanLimits::for(Plan::Free)->queuePriority())
        ->toBe(10)
        ->toBeGreaterThan(PlanLimits::for(Plan::Pro)->queuePriority());
});

test('pro plan queue priority is 1', function () {
    expect(PlanLimits::for(Plan::Pro)->queuePriority())->toBe(1);
});

test('when monetization is disabled, every plan resolves with pro-tier limits', function () {
    config(['plans.enabled' => false]);

    expect(PlanLimits::for(Plan::Free)->siteCap())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->pageCap())->toBe(100)
        ->and(PlanLimits::for(Plan::Free)->allowedCrawlDepths())->toBe([
            CrawlDepth::Shallow,
            CrawlDepth::Standard,
            CrawlDepth::Deep,
        ])
        ->and(PlanLimits::for(Plan::Free)->rescanFrequencyMinutes())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->historyRetention())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->queuePriority())->toBe(1);
});
