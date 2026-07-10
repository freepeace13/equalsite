<?php

namespace App\Http\Controllers\Api;

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessAuditArtifacts;
use Illuminate\Http\Request;
use Throwable;

class CrawlerCallbackController extends Controller
{
    public function __invoke(Request $request, UnzipCrawlerArtifacts $zip)
    {
        if ($request->boolean('probe')) {
            return response()->json(['ok' => true]);
        }

        if ($request->hasFile('artifact')) {
            try {
                $zipFile = $request->file('artifact');
                $zip->unzip($request->auditId, $zipFile->getRealPath());
                ProcessAuditArtifacts::dispatch($request->auditId);
            } catch (Throwable $e) {
                report($e);
            }
        }

        return response()->json([
            'ok' => true,
        ]);
    }
}
