<?php

namespace App\Exceptions\Audit;

use Carbon\CarbonInterface;
use Exception;

/**
 * Thrown by CreateAudit when a free-tier account tries to re-scan a domain
 * before its plan's re-scan-frequency window has elapsed. Caught directly in
 * RequestController and turned into a 302 redirect-back-with-errors — this is
 * response shaping (it carries a computed "available at" timestamp), not a
 * yes/no authorization gate, so it deliberately isn't a policy check.
 */
class RescanTooSoonException extends Exception
{
    public function __construct(public readonly CarbonInterface $availableAt)
    {
        parent::__construct('next scan available at '.$availableAt->toIso8601String());
    }
}
