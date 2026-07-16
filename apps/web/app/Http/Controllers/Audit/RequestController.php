<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CreateAudit;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Audit\AuditCreateRequest;
use Illuminate\Http\RedirectResponse;

class RequestController extends Controller
{
    public function __invoke(AuditCreateRequest $request, CreateAudit $creator): RedirectResponse
    {
        try {
            $audit = $creator->create(
                $request->user(),
                $request->string('url')->toString(),
                $request->only(['crawlDepth', 'include', 'exclude', 'sameDomain']),
            );
        } catch (RescanTooSoonException $e) {
            return back()
                ->withErrors(['url' => $e->getMessage()])
                ->with('rescanAvailableAt', $e->availableAt->toIso8601String());
        }

        return redirect()->route('audit.progress', [
            'id' => $audit->crawler_id,
        ]);
    }
}
