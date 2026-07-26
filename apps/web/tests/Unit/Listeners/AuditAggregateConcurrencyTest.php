<?php

use App\Events\Audit\AuditPageStarted;
use App\Events\Audit\AuditProgress;
use App\Events\Audit\AuditQueued;
use App\Events\Audit\AuditStarted;
use App\Listeners\AuditPageSubscriber;
use App\Listeners\AuditProgressListener;
use App\Listeners\AuditQueueStateListener;
use App\Listeners\AuditStatusSubscriber;
use App\Value\RedisStreamData;
use Illuminate\Queue\Middleware\WithoutOverlapping;

function makeStreamEvent(string $type, array $payload): RedisStreamData
{
    return new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: $type,
        payload: $payload,
        version: '1',
        timestamp: now()->getTimestampMs(),
    );
}

test('all audit aggregate listeners share one overlap lock per audit', function () {
    $crawlerId = 'crawler-lock-test';

    $pairs = [
        [new AuditPageSubscriber, new AuditPageStarted(makeStreamEvent('audit.page.started', [
            'auditId' => $crawlerId, 'pageUrl' => 'https://acme.com', 'attemptsCount' => 1,
        ]))],
        [new AuditProgressListener, new AuditProgress(makeStreamEvent('audit.progress', [
            'auditId' => $crawlerId, 'completedRequests' => 1, 'pendingRequests' => 1, 'totalRequests' => 2, 'progressPercentage' => 50,
        ]))],
        [new AuditQueueStateListener, new AuditQueued(makeStreamEvent('audit.queued', [
            'auditId' => $crawlerId, 'position' => 1, 'ahead' => 0, 'waiting' => 1,
        ]))],
        [new AuditStatusSubscriber, new AuditStarted(makeStreamEvent('audit.started', [
            'auditId' => $crawlerId,
        ]))],
    ];

    $lockKeys = collect($pairs)->map(function (array $pair) {
        [$listener, $event] = $pair;

        /** @var WithoutOverlapping $middleware */
        $middleware = $listener->middleware($event)[0];

        expect($middleware)->toBeInstanceOf(WithoutOverlapping::class);
        expect($middleware->shareKey)->toBeTrue();

        return $middleware->getLockKey(new stdClass);
    });

    // Same audit, four different listener classes: without a shared() lock key,
    // each class would hash its own displayName into the key and never contend
    // with the others — which is exactly how the version-conflict race happened.
    expect($lockKeys->unique())->toHaveCount(1);
});

test('a different audit gets its own overlap lock', function () {
    $listener = new AuditProgressListener;

    $eventA = new AuditProgress(makeStreamEvent('audit.progress', [
        'auditId' => 'crawler-a', 'completedRequests' => 1, 'pendingRequests' => 1, 'totalRequests' => 2, 'progressPercentage' => 50,
    ]));
    $eventB = new AuditProgress(makeStreamEvent('audit.progress', [
        'auditId' => 'crawler-b', 'completedRequests' => 1, 'pendingRequests' => 1, 'totalRequests' => 2, 'progressPercentage' => 50,
    ]));

    $keyA = $listener->middleware($eventA)[0]->getLockKey(new stdClass);
    $keyB = $listener->middleware($eventB)[0]->getLockKey(new stdClass);

    expect($keyA)->not->toBe($keyB);
});

test('audit aggregate listeners retry lock contention instead of failing permanently', function () {
    $listeners = [new AuditPageSubscriber, new AuditProgressListener, new AuditQueueStateListener, new AuditStatusSubscriber];
    $event = new AuditStarted(makeStreamEvent('audit.started', ['auditId' => 'crawler-tries-test']));

    foreach ($listeners as $listener) {
        expect($listener->tries($event))->toBeGreaterThan(1);
        expect($listener->backoff($event))->toBeArray()->not->toBeEmpty();
    }
});
