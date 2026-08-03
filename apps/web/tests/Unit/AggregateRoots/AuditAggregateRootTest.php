<?php

use App\AggregateRoots\AuditAggregateRoot;
use App\StorableEvents\Audit\AuditPageWasCompleted;
use App\StorableEvents\Audit\AuditPageWasFailed;
use App\StorableEvents\Audit\AuditPageWasSkipped;
use App\StorableEvents\Audit\AuditPageWasStarted;
use App\StorableEvents\Audit\AuditProgressWasUpdated;
use App\StorableEvents\Audit\AuditQueueStateWasUpdated;
use App\StorableEvents\Audit\AuditWasCancelled;
use App\StorableEvents\Audit\AuditWasCompleted;
use App\StorableEvents\Audit\AuditWasCreated;
use App\StorableEvents\Audit\AuditWasFailed;
use App\StorableEvents\Audit\AuditWasStarted;

test('create records AuditWasCreated', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->when(function (AuditAggregateRoot $aggregate) {
            $aggregate->create(1, 'https://acme.com', 'acme.com');
        })
        ->assertRecorded([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
        ]);
});

test('updateQueueState records AuditQueueStateWasUpdated', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->updateQueueState(2, 1, 3))
        ->assertRecorded([new AuditQueueStateWasUpdated(2, 1, 3)]);
});

test('start records AuditWasStarted', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->start('2026-07-26T00:00:00+00:00'))
        ->assertRecorded([new AuditWasStarted('2026-07-26T00:00:00+00:00')]);
});

test('updateProgress records AuditProgressWasUpdated', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditWasStarted('2026-07-26T00:00:00+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->updateProgress(1, 2, 3, 33.3))
        ->assertRecorded([new AuditProgressWasUpdated(1, 2, 3, 33.3)]);
});

test('pageStarted records AuditPageWasStarted', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageStarted(
            'https://acme.com/about', 1, '2026-07-26T00:00:00+00:00'
        ))
        ->assertRecorded([
            new AuditPageWasStarted('https://acme.com/about', 1, '2026-07-26T00:00:00+00:00'),
        ]);
});

test('pageStarted is a no-op once the page has already completed', function () {
    $breakdown = ['critical' => 1, 'serious' => 0, 'moderate' => 0, 'minor' => 0];

    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditPageWasStarted('https://acme.com/about', 0, '2026-07-26T00:00:00+00:00'),
            new AuditPageWasCompleted('https://acme.com/about', 1, $breakdown, '2026-07-26T00:00:01+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageStarted(
            'https://acme.com/about', 0, '2026-07-26T00:00:00+00:00'
        ))
        ->assertNotRecorded(AuditPageWasStarted::class);
});

test('pageStarted is a no-op once the page has already failed', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditPageWasStarted('https://acme.com/about', 0, '2026-07-26T00:00:00+00:00'),
            new AuditPageWasFailed('https://acme.com/about', 3, 'Navigation timeout', 'timeout', '2026-07-26T00:00:01+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageStarted(
            'https://acme.com/about', 0, '2026-07-26T00:00:00+00:00'
        ))
        ->assertNotRecorded(AuditPageWasStarted::class);
});

test('pageStarted is a no-op once the page has already been skipped', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditPageWasSkipped('https://acme.com/robots', 'Blocked by robots.txt', '2026-07-26T00:00:00+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageStarted(
            'https://acme.com/robots', 0, '2026-07-26T00:00:01+00:00'
        ))
        ->assertNotRecorded(AuditPageWasStarted::class);
});

test('pageStarted still records a legitimate retry after a page starts but has not reached a terminal state', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditPageWasStarted('https://acme.com/about', 0, '2026-07-26T00:00:00+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageStarted(
            'https://acme.com/about', 1, '2026-07-26T00:00:01+00:00'
        ))
        ->assertRecorded([
            new AuditPageWasStarted('https://acme.com/about', 1, '2026-07-26T00:00:01+00:00'),
        ]);
});

test('pageSkipped records AuditPageWasSkipped', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageSkipped(
            'https://acme.com/robots', 'Blocked by robots.txt', '2026-07-26T00:00:00+00:00'
        ))
        ->assertRecorded([
            new AuditPageWasSkipped('https://acme.com/robots', 'Blocked by robots.txt', '2026-07-26T00:00:00+00:00'),
        ]);
});

test('pageFailed records AuditPageWasFailed', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageFailed(
            'https://acme.com/about', 3, 'Navigation timeout', 'timeout', '2026-07-26T00:00:00+00:00'
        ))
        ->assertRecorded([
            new AuditPageWasFailed('https://acme.com/about', 3, 'Navigation timeout', 'timeout', '2026-07-26T00:00:00+00:00'),
        ]);
});

test('pageCompleted records AuditPageWasCompleted', function () {
    $breakdown = ['critical' => 1, 'serious' => 0, 'moderate' => 0, 'minor' => 0];

    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->pageCompleted(
            'https://acme.com/', 1, $breakdown, '2026-07-26T00:00:00+00:00'
        ))
        ->assertRecorded([
            new AuditPageWasCompleted('https://acme.com/', 1, $breakdown, '2026-07-26T00:00:00+00:00'),
        ]);
});

test('fail records AuditWasFailed', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->fail('boom', 'dns_error'))
        ->assertRecorded([new AuditWasFailed('boom', 'dns_error')]);
});

test('fail is a no-op once the audit is cancelled', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditWasCancelled('2026-07-26T00:00:00+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->fail('boom', null))
        ->assertNotRecorded(AuditWasFailed::class);
});

test('complete records AuditWasCompleted', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->complete('2026-07-26T00:00:00+00:00'))
        ->assertRecorded([new AuditWasCompleted('2026-07-26T00:00:00+00:00')]);
});

test('complete is a no-op once the audit is cancelled', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([
            new AuditWasCreated(1, 'https://acme.com', 'acme.com'),
            new AuditWasCancelled('2026-07-26T00:00:00+00:00'),
        ])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->complete('2026-07-26T00:00:00+00:00'))
        ->assertNotRecorded(AuditWasCompleted::class);
});

test('cancel records AuditWasCancelled', function () {
    AuditAggregateRoot::fake('crawler-1')
        ->given([new AuditWasCreated(1, 'https://acme.com', 'acme.com')])
        ->when(fn (AuditAggregateRoot $aggregate) => $aggregate->cancel('2026-07-26T00:00:00+00:00'))
        ->assertRecorded([new AuditWasCancelled('2026-07-26T00:00:00+00:00')]);
});
