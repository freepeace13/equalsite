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
    | never via config('plans.*') directly from other classes. The env-backed
    | exceptions are free.rescan_frequency_minutes (RESCAN_FREQUENCY_MINUTES),
    | free.page_cap (FREE_PAGE_CAP), and pro.page_cap (PRO_PAGE_CAP), for
    | experimenting with those limits without a code change.
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
        'page_cap' => env('FREE_PAGE_CAP', 50),
        'crawl_depths' => [
            CrawlDepth::Shallow->value,
        ],
        'rescan_frequency_minutes' => env('RESCAN_FREQUENCY_MINUTES', 60),
        'history_retention' => 5,
        'queue_priority' => 10,
    ],

    'pro' => [
        'site_cap' => null, // null = unlimited
        'page_cap' => env('PRO_PAGE_CAP', 150),
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
