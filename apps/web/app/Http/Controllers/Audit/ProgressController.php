<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Models\AuditPage;
use App\Value\ScanInfo;
use App\Value\ScanProgress;
use App\Value\ScanQueue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgressController extends Controller
{
    public function __invoke(Request $request)
    {
        $audit = Audit::where('crawler_id', $request->route('id'))->firstOrFail();

        return Inertia::render('audit/progress', [
            'scanInfo' => ScanInfo::fromAudit($audit),
            'scanQueue' => ScanQueue::fromAudit($audit),
            'scanUrls' => $audit->pages()
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (AuditPage $page) => $page->toProp())
                ->all(),
            'scanProgress' => ScanProgress::fromAudit($audit),
        ]);
    }
}
