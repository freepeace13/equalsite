<?php

namespace App\Services;

use App\Contracts\ArtifactRepository as ArtifactRepositoryContract;
use App\Value\AxeResult;
use Illuminate\Support\Facades\Storage;

class ArtifactRepository implements ArtifactRepositoryContract
{
    protected $directory = 'audits';

    public function getAxeResults(string $id): array
    {
        $disk = Storage::disk('audit_artifacts');
        $prefix = "{$this->directory}/{$id}/artifacts";

        return collect($disk->files($prefix))
            ->map(fn (string $path) => json_decode($disk->get($path), true))
            ->filter(fn ($array) => is_array($array))
            ->values()
            ->map(fn (array $array) => AxeResult::fromArray($array))
            ->all();
    }

    public function delete(string $id): void
    {
        Storage::disk('audit_artifacts')->deleteDirectory("{$this->directory}/{$id}");
    }
}
