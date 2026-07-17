<?php

namespace App\Support\Spider;

use App\Contracts\Spider;
use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function download(string $id)
    {
        return $this->send(fn () => Http::spider()->get("download/{$id}"));
    }

    public function create(SpiderOptions $options): array
    {
        // Log::debug('SpiderClient Request body: ', $options->toArray());
        return $this->send(fn () => Http::spider()->post('audit', $options->toArray()));
    }

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    protected function send(Closure $request): array
    {
        try {
            return $request()->json();
        } catch (RequestException $e) {
            throw $e->response->status() === 400
                ? SpiderValidationException::fromResponse($e)
                : SpiderUnavailableException::fromResponse($e);
        } catch (ConnectionException $e) {
            throw SpiderUnavailableException::fromConnectionFailure($e);
        }
    }
}
