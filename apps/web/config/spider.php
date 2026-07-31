<?php

use App\Value\CrawlDepth;

return [
    'page_cap' => (int) env('SPIDER_PAGE_CAP', 30),

    'rescan_frequency_minutes' => env('SPIDER_RESCAN_FREQUENCY_MINUTES', 60),

    'crawl_depths' => [
        CrawlDepth::Shallow->value,
        CrawlDepth::Standard->value,
        CrawlDepth::Deep->value,
    ],
];
