<?php

namespace App\Exceptions\Audit;

use Exception;

/**
 * Thrown by CreateAudit when a free-tier account tries to add a genuinely new
 * site beyond its plan's site cap. Caught directly in StoreController and
 * turned into a 302 redirect-back-with-errors — this carries an
 * upgrade-oriented message, not a yes/no authorization gate, so it
 * deliberately isn't a policy check (mirrors RescanTooSoonException).
 */
class SiteCapExceededException extends Exception
{
    public function __construct(public readonly int $siteCap)
    {
        $plural = $siteCap === 1 ? 'site' : 'sites';

        parent::__construct("You've reached your plan's limit of {$siteCap} {$plural}. Upgrade to Pro to add more sites.");
    }
}
