<?php

use App\Support\Plan\PlanLimits;
use App\Value\CrawlDepth;
use App\Value\Plan;
use Tests\TestCase;

// Needs the framework booted so config('plans.*')/config('spider.*') resolve —
// PlanLimits is the single seam over both, so these tests pin that contract.
// page_cap, crawl_depths, and rescan_frequency_minutes come from spider.php
// and are identical across plans; only site_cap, history_retention, and
// queue_priority remain plan-scoped.
uses(TestCase::class);

test('free plan caps sites to 1', function () {
    expect(PlanLimits::for(Plan::Free)->siteCap())->toBe(1);
});

test('pro plan has no site cap', function () {
    expect(PlanLimits::for(Plan::Pro)->siteCap())->toBeNull();
});

test('free plan page cap matches the spider config, not a plan-scoped value', function () {
    expect(PlanLimits::for(Plan::Free)->pageCap())->toBe((int) config('spider.page_cap'));
});

test('pro plan page cap matches the spider config', function () {
    expect(PlanLimits::for(Plan::Pro)->pageCap())->toBe((int) config('spider.page_cap'));
});

test('free plan allows every crawl depth configured in spider config', function () {
    expect(PlanLimits::for(Plan::Free)->allowedCrawlDepths())->toBe([
        CrawlDepth::Shallow,
        CrawlDepth::Standard,
        CrawlDepth::Deep,
    ]);
});

test('pro plan allows every crawl depth', function () {
    expect(PlanLimits::for(Plan::Pro)->allowedCrawlDepths())->toBe([
        CrawlDepth::Shallow,
        CrawlDepth::Standard,
        CrawlDepth::Deep,
    ]);
});

test('free plan passes every requested depth through unclamped', function (CrawlDepth $requested) {
    expect(PlanLimits::for(Plan::Free)->clampCrawlDepth($requested))->toBe($requested);
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

test('free plan re-scan frequency matches the spider config', function () {
    expect(PlanLimits::for(Plan::Free)->rescanFrequencyMinutes())->toBe((int) config('spider.rescan_frequency_minutes'));
});

test('pro plan re-scan frequency matches the spider config', function () {
    expect(PlanLimits::for(Plan::Pro)->rescanFrequencyMinutes())->toBe((int) config('spider.rescan_frequency_minutes'));
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
        ->and(PlanLimits::for(Plan::Free)->pageCap())->toBe((int) config('spider.page_cap'))
        ->and(PlanLimits::for(Plan::Free)->allowedCrawlDepths())->toBe([
            CrawlDepth::Shallow,
            CrawlDepth::Standard,
            CrawlDepth::Deep,
        ])
        ->and(PlanLimits::for(Plan::Free)->rescanFrequencyMinutes())->toBe((int) config('spider.rescan_frequency_minutes'))
        ->and(PlanLimits::for(Plan::Free)->historyRetention())->toBeNull()
        ->and(PlanLimits::for(Plan::Free)->queuePriority())->toBe(1);
});
