<?php

namespace App\Exceptions\Spider;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;

/**
 * Thrown when the crawler-api can't be reached or fails for reasons outside
 * our control: connection/timeout failures, auth misconfiguration, or a
 * non-validation error response (401/403/404/5xx).
 */
class SpiderUnavailableException extends SpiderException
{
    public function __construct(string $message, public readonly ?int $status, RequestException|ConnectionException $previous)
    {
        parent::__construct($message, $previous);
    }

    public static function fromResponse(RequestException $e): self
    {
        return new self(
            "The crawler service returned an unexpected error (HTTP {$e->response->status()}).",
            $e->response->status(),
            $e,
        );
    }

    public static function fromConnectionFailure(ConnectionException $e): self
    {
        return new self('The crawler service could not be reached.', null, $e);
    }

    /**
     * @return array{status: ?int}
     */
    public function context(): array
    {
        return ['status' => $this->status];
    }
}
