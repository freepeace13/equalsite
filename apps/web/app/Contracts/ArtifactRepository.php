<?php

namespace App\Contracts;

use App\Value\AxeResult;

interface ArtifactRepository
{
    /** @return AxeResult[] */
    public function getAxeResults(string $id): array;

    public function delete(string $id): void;
}
