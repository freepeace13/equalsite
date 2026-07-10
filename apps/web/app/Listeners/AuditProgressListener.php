<?php

namespace App\Listeners;

use App\Events\Audit\AuditProgress;
use App\Events\Audit\BaseEvent;
use App\Models\Audit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\DB;

class AuditProgressListener implements ShouldQueue
{
    // public function middleware(BaseEvent $event)
    // {
    //     return [
    //         (new WithoutOverlapping('audit-' . $event->crawlerId() . '-progress'))->shared()
    //     ];
    // }

    public function __invoke(AuditProgress $event)
    {
        DB::transaction(function () use ($event) {
            $audit = Audit::where('crawler_id', $event->crawlerId())
                ->lockForUpdate()
                ->first();

            if ($audit) {
                $payload = $event->payload();

                $audit->setCustomData('progress_state', [
                    'completedRequests' => $payload['completedRequests'],
                    'pendingRequests' => $payload['pendingRequests'],
                    'totalRequests' => $payload['totalRequests'],
                    'progressPercentage' => $payload['progressPercentage'],
                ]);
            }
        });
    }
}
