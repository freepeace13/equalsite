<?php

namespace App\Exceptions\Audit;

use Exception;

/**
 * Thrown by CreateAudit when the target domain is on the block list (e.g.
 * after an abuse report). Caught directly in StoreController and turned
 * into a 302 redirect-back-with-errors — mirrors SiteCapExceededException
 * and AuditInProgressException.
 */
class DomainBlockedException extends Exception
{
    public function __construct(public readonly string $domain)
    {
        parent::__construct("This site can't be scanned right now. Contact support if you believe this is a mistake.");
    }
}
