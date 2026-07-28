<?php

namespace App\Support\Spider;

use App\Contracts\Spider;
use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class SpiderClient implements Spider
{
    public function cancel(string $id): array
    {
        return $this->send(fn () => Http::spider()->delete("audit/{$id}"));
    }

    public function ping(): array
    {
        return $this->send(fn () => Http::spider()->get('ping'));
    }

    public function create(SpiderOptions $options): array
    {
        return $this->send(fn () => Http::spider()->post('audit', $options->toArray()));
    }

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    protected function send(Closure $request): array
    {
        return $this->attempt(fn () => $request()->json());
    }

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    protected function attempt(Closure $callback): mixed
    {
        try {
            return $callback();
        } catch (RequestException $e) {
            throw $e->response->status() === 400
                ? SpiderValidationException::fromResponse($e)
                : SpiderUnavailableException::fromResponse($e);
        } catch (ConnectionException $e) {
            throw SpiderUnavailableException::fromConnectionFailure($e);
        }
    }
}
