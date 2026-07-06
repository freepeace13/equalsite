<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CreateAudit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Audit\AuditCreateRequest;

class RequestController extends Controller
{
    public function __invoke(AuditCreateRequest $request, CreateAudit $creator)
    {
        $audit = $creator->create($request->url, $request->only([
            'crawlDepth',
            'include',
            'exclude',
            'sameDomain',
        ]));

        return redirect()->route('audit.progress', [
            'id' => $audit->crawler_id,
        ]);
    }
}
