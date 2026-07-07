<?php

namespace App\Console\Commands;

use App\Events;
use App\Events\RedisStreamEvent;
use App\Support\RedisStream;
use App\Value\RedisStreamData;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('spider:listen
    {--stream= : Redis stream to consume (defaults to STREAM_NAME env, falling back to equalsite:crawler:events)}
    {--group=laravel-workers : Consumer group name}
    {--consumer= : Unique consumer identifier (defaults to hostname-pid)}
')]
#[Description('Consume the crawler Redis stream and dispatch corresponding Laravel audit events')]
class SpiderListenCommand extends Command
{
    public function handle(
        RedisStream $stream
    ) {
        $streamName = $this->option('stream') ?: env('STREAM_NAME', 'equalsite:crawler:events');
        $group = $this->option('group');

        $consumer = $this->option('consumer') ?: sprintf(
            '%s-%s',
            gethostname(),
            getmypid()
        );

        // create group if not exists
        $stream->createConsumerGroup($streamName, $group);

        $this->info(sprintf(
            'Listening to stream [%s] as consumer [%s]',
            $streamName,
            $consumer
        ));

        $stream->consume(
            stream: $streamName,
            group: $group,
            consumer: $consumer,
            handler: function ($data) {
                $this->info(sprintf(
                    '%s [Redis Stream] Message received: %s',
                    Carbon::createFromTimestampMs($data->timestamp)->toDateTimeString(),
                    json_encode(['type' => $data->type, 'payload' => $data->payload])
                ));

                $this->dispatchEvent($data);
            }
        );

        return self::SUCCESS;
    }

    private function dispatchEvent(RedisStreamData $data)
    {
        event(match ($data->type) {
            'audit.queued' => new Events\Audit\AuditQueued($data),
            'audit.started' => new Events\Audit\AuditStarted($data),
            'audit.progress' => new Events\Audit\AuditProgress($data),
            'audit.completed' => new Events\Audit\AuditCompleted($data),
            'audit.failed' => new Events\Audit\AuditFailed($data),
            'audit.cancelled' => new Events\Audit\AuditCancelled($data),
            'audit.page.started' => new Events\Audit\AuditPageStarted($data),
            'audit.page.skipped' => new Events\Audit\AuditPageSkipped($data),
            'audit.page.failed' => new Events\Audit\AuditPageFailed($data),
            'audit.page.completed' => new Events\Audit\AuditPageCompleted($data),
            default => new RedisStreamEvent($data)
        });
    }
}
