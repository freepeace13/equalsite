<?php

namespace App\Exceptions\Audit;

use Exception;

/**
 * Thrown by CreateAudit when the account already has a queued/started audit
 * for this domain. Caught directly in StoreController and turned into a 302
 * redirect-back-with-errors — this is response shaping, not a yes/no
 * authorization gate, so it deliberately isn't a policy check (mirrors
 * RescanTooSoonException and SiteCapExceededException).
 */
class AuditInProgressException extends Exception
{
    public function __construct()
    {
        parent::__construct('A scan for this site is already in progress. Please wait for it to finish before starting another.');
    }
}
