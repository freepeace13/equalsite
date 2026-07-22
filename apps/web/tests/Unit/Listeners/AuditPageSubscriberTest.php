<?php

use App\Events\Audit\AuditPageFailed;
use App\Listeners\AuditPageSubscriber;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('handlePageFailed stores the classified error code alongside the raw message', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-page-failed', 'acme.com', Status::Started);

    $event = new AuditPageFailed(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.page.failed',
        payload: [
            'auditId' => 'crawler-page-failed',
            'pageUrl' => 'https://acme.com/about',
            'attemptsCount' => 3,
            'errorMessage' => 'Navigation timeout of 45000 ms exceeded',
            'errorCode' => 'timeout',
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditPageSubscriber)->handlePageFailed($event);

    $scannedUrls = $audit->fresh()->getCustomData('scanned_urls');

    expect($scannedUrls['https://acme.com/about']['errorCode'])->toBe('timeout');
    expect($scannedUrls['https://acme.com/about']['status'])->toBe('failed');
});
