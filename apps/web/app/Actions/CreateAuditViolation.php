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
                'screenshot_path' => $this->resolveScreenshotPath($audit->crawler_id, $violation->screenshotPath),
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

    protected function resolveScreenshotPath(string $crawlerId, string $relativePath): ?string
    {
        $path = "audits/{$crawlerId}/{$relativePath}";

        return Storage::disk('audit_artifacts')->exists($path) ? $path : null;
    }
}
