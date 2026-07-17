<?php

namespace App\Contracts;

use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use App\Support\Spider\SpiderOptions;

/**
 * @see "packages/types/src/node/api.ts"
 * */
interface Spider
{
    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    public function ping(): array;

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    public function create(SpiderOptions $options): array;

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    public function cancel(string $id): array;

    public function download(string $id): string;
}
