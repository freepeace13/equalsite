<?php

namespace App\Http\Controllers\Audit;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use App\Value\ScanInfo;
use App\Value\ScannedUrl;
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
            'scanUrls' => ScannedUrl::mapFromAudit($audit),
            'scanProgress' => ScanProgress::fromAudit($audit),
        ]);
    }
}
