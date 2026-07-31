<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Plan limits
    |--------------------------------------------------------------------------
    |
    | Centralizes every numeric/behavioral limit driven by a user's plan, keyed
    | by App\Value\Plan::value. This is a deploy-time constant, not something
    | edited at runtime — read exclusively through App\Support\Plan\PlanLimits,
    | never via config('plans.*') directly from other classes.
    |
    | page_cap, crawl_depths, and rescan_frequency_minutes are NOT plan-driven:
    | PlanLimits reads those from config/spider.php for every plan (free and
    | pro alike), so they are intentionally absent here.
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
        'history_retention' => 5,
        'queue_priority' => 10,
    ],

    'pro' => [
        'site_cap' => null, // null = unlimited
        'history_retention' => null, // null = unlimited
        'queue_priority' => 1,
    ],

];
