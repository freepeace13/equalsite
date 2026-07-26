<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\GenerateRemediationMarkdown;
use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Response;

class ExportMarkdownController extends Controller
{
    public function __invoke(string $id, GenerateRemediationMarkdown $action): Response
    {
        $audit = Audit::where('crawler_id', $id)->firstOrFail();

        if (! $audit->status->completed()) {
            abort(404);
        }

        $audit->loadMissing(['violations', 'pages']);

        $markdown = $action->generate($audit);
        $filename = sprintf('equalsite-%s-%s.md', $audit->domain, now()->toDateString());

        return response($markdown, 200, [
            'Content-Type' => 'text/markdown; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
