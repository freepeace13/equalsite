<?php

use App\Events\Audit\AuditProgress;
use App\Listeners\AuditProgressListener;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('progress events update custom_data.progress_state', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-progress', 'acme.com', Status::Started);

    $event = new AuditProgress(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.progress',
        payload: [
            'auditId' => 'crawler-progress',
            'completedRequests' => 4,
            'pendingRequests' => 6,
            'totalRequests' => 10,
            'progressPercentage' => 40.5,
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditProgressListener)($event);

    expect($audit->fresh()->getCustomData('progress_state'))->toEqual([
        'completedRequests' => 4,
        'pendingRequests' => 6,
        'totalRequests' => 10,
        'progressPercentage' => 40.5,
    ]);
});
