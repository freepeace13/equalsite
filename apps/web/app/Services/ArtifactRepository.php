<?php

namespace App\Services;

use App\Contracts\ArtifactRepository as ArtifactRepositoryContract;
use App\Value\AxeResult;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class ArtifactRepository implements ArtifactRepositoryContract
{
    protected $directory = 'audits';

    public function getAxeResults(string $id): array
    {
        $pattern = $this->getPath($id).'datasets/default/*.json';

        return collect(File::glob($pattern))
            ->map(fn (string $path) => File::json($path))
            ->map(fn (array $array) => AxeResult::fromArray($array))
            ->all();
    }

    public function getPath(string $id): string
    {
        return Storage::path("{$this->directory}/{$id}/");
    }
}
