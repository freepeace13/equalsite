<?php

namespace App\Actions;

use App\Contracts\ArtifactRepository;
use App\Models\Audit;
use App\Value\AxeItem;
use App\Value\Impact;
use Illuminate\Support\Facades\Storage;

class CreateAuditViolation
{
    public function __construct(
        protected ArtifactRepository $repository
    ) {}

    public function create(Audit $audit, string $url, AxeItem $violation)
    {
        $model = $audit->violations()->firstOrCreate([
            'rule_id' => $violation->id,
            'impact_level' => Impact::from($violation->impact),
        ], [
            'description' => $violation->description,
            'nodes' => [],
            'help_url' => $violation->helpUrl,
            'failure_summary' => array_first($violation->nodes)?->failureSummary,
        ]);

        if ($model->wasRecentlyCreated && $violation->screenshotPath) {
            $model->forceFill([
                'screenshot_path' => $this->persistScreenshot($audit->crawler_id, $violation->screenshotPath),
            ]);
        }

        foreach ($violation->nodes as $node) {
            $model->nodes->sync([
                'url' => $url,
                'html' => $node->html,
                'target' => array_first($node->target),
            ]);
        }

        $model->save();
    }

    protected function persistScreenshot(string $crawlerId, string $relativePath): ?string
    {
        $sourcePath = $this->repository->getPath($crawlerId).$relativePath;

        if (! is_file($sourcePath)) {
            return null;
        }

        $destination = "audits/{$crawlerId}/".basename($relativePath);
        Storage::disk('public')->put($destination, file_get_contents($sourcePath));

        return $destination;
    }
}
