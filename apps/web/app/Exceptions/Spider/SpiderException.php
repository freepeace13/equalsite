<?php

namespace App\Exceptions\Spider;

use Exception;
use Throwable;

/**
 * Base for failures talking to the crawler-api via SpiderClient. Caught at
 * the controller layer (RequestController, CancelController) and turned into
 * a redirect-back-with-errors, mirroring RescanTooSoonException.
 */
abstract class SpiderException extends Exception
{
    public function __construct(string $message, Throwable $previous)
    {
        parent::__construct($message, previous: $previous);
    }
}
