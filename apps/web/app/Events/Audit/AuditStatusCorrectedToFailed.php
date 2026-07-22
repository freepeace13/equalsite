<?php

namespace App\Events\Audit;

use App\Value\RedisStreamData;

/**
 * Broadcast-only correction: fired when Laravel reclassifies a "completed" audit as
 * failed (every scanned URL failed) after the worker already reported it complete.
 * Deliberately unregistered in AuditStatusSubscriber::subscribe() — the DB write for
 * this case is done directly by handleAuditCompleted, not by a listener on this event.
 * Broadcasts under the 'audit.failed' event name so the existing frontend handler in
 * use-audit-progress-stream.ts (added in Task 9) picks it up with zero frontend changes.
 */
class AuditStatusCorrectedToFailed extends BaseEvent
{
    public function broadcastData(RedisStreamData $stream): array
    {
        return $stream->payload;
    }
}
