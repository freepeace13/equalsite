<?php

use App\Events\Audit\AuditQueued;
use App\Listeners\AuditQueueStateListener;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('queued events update custom_data.queue_state', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-queued', 'acme.com', Status::Queued);

    $event = new AuditQueued(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.queued',
        payload: [
            'auditId' => 'crawler-queued',
            'position' => 3,
            'ahead' => 2,
            'waiting' => 5,
        ],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));

    (new AuditQueueStateListener)($event);

    expect($audit->fresh()->getCustomData('queue_state'))->toEqual([
        'position' => 3,
        'ahead' => 2,
        'waiting' => 5,
    ]);
});
