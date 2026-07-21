<?php

use App\Value\CrawlDepth;

return [

    /*
    |--------------------------------------------------------------------------
    | Plan limits
    |--------------------------------------------------------------------------
    |
    | Centralizes every numeric/behavioral limit driven by a user's plan, keyed
    | by App\Value\Plan::value. This is a deploy-time constant, not something
    | edited at runtime — read exclusively through App\Support\Plan\PlanLimits,
    | never via config('plans.*') directly from other classes. The one env-backed
    | exception is free.rescan_frequency_minutes, exposed via RESCAN_FREQUENCY_MINUTES
    | for experimenting with the window without a code change.
    |
    | 'queue_priority' is populated for a future BullMQ-priority pass but is not
    | read by anything yet in this pass.
    |
    | 'enabled' gates all of the above: when false, PlanLimits::for() resolves
    | every plan as Pro regardless of what's passed in, so every scan runs
    | unrestricted. Toggle via MONETIZATION_ENABLED; default true (today's
    | behavior unchanged).
    |
    */

    'enabled' => env('MONETIZATION_ENABLED', true),

    'free' => [
        'site_cap' => 1,
        'page_cap' => 50,
        'crawl_depths' => [
            CrawlDepth::Shallow->value,
        ],
        'rescan_frequency_minutes' => env('RESCAN_FREQUENCY_MINUTES', 60),
        'history_retention' => 5,
        'queue_priority' => 10,
    ],

    'pro' => [
        'site_cap' => null, // null = unlimited
        'page_cap' => 100,
        'crawl_depths' => [
            CrawlDepth::Shallow->value,
            CrawlDepth::Standard->value,
            CrawlDepth::Deep->value,
        ],
        'rescan_frequency_minutes' => null, // null = no cap
        'history_retention' => null, // null = unlimited
        'queue_priority' => 1,
    ],

];
