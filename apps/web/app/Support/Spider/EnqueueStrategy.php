<?php

namespace App\Support\Spider;

/**
 * This enum replicates the enqueue strategy definitions from the crawlee node package.
 *
 * @see https://crawlee.dev/js/api/core/enum/EnqueueStrategy
 */
enum EnqueueStrategy: string
{
    case All = 'all';
    case SameHostname = 'same-hostname';
    case SameDomain = 'same-domain';
    case SameOrigin = 'same-origin';
}
