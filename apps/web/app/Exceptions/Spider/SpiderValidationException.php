<?php

namespace App\Exceptions\Spider;

use Illuminate\Http\Client\RequestException;

/**
 * Thrown when the crawler-api rejects a request as malformed: HTTP 400 with
 * a { errors: [{ field, message }] } body.
 *
 * @see "services/playwright-spider/src/app/middleware/validationMiddleware.ts"
 */
class SpiderValidationException extends SpiderException
{
    /**
     * @param  list<array{field: string, message: string}>  $errors
     */
    public function __construct(string $message, public readonly array $errors, RequestException $previous)
    {
        parent::__construct($message, $previous);
    }

    public static function fromResponse(RequestException $e): self
    {
        $body = $e->response->json();
        $errors = is_array($body['errors'] ?? null) ? $body['errors'] : [];

        return new self(
            is_string($body['message'] ?? null) ? $body['message'] : 'The crawler service rejected the request.',
            $errors,
            $e,
        );
    }

    /**
     * @return array{errors: list<array{field: string, message: string}>}
     */
    public function context(): array
    {
        return ['errors' => $this->errors];
    }
}
