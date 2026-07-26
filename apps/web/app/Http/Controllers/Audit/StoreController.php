<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CreateAudit;
use App\Exceptions\Audit\AuditInProgressException;
use App\Exceptions\Audit\DomainBlockedException;
use App\Exceptions\Audit\RescanTooSoonException;
use App\Exceptions\Audit\SiteCapExceededException;
use App\Exceptions\Spider\SpiderException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Audit\AuditCreateRequest;
use Illuminate\Http\RedirectResponse;

class StoreController extends Controller
{
    public function __invoke(AuditCreateRequest $request, CreateAudit $creator): RedirectResponse
    {
        try {
            $audit = $creator->create(
                $request->user(),
                $request->string('url')->toString(),
                $request->only(['crawlDepth', 'include', 'exclude', 'sameDomain']),
            );
        } catch (AuditInProgressException $e) {
            return back()->withErrors(['url' => $e->getMessage()]);
        } catch (RescanTooSoonException $e) {
            return back()
                ->withErrors(['url' => $e->getMessage()])
                ->with('rescanAvailableAt', $e->availableAt->toDateTimeString());
        } catch (SiteCapExceededException $e) {
            return back()->withErrors(['url' => $e->getMessage()]);
        } catch (DomainBlockedException $e) {
            return back()->withErrors(['url' => $e->getMessage()]);
        } catch (SpiderException $e) {
            report($e);

            return back()->withErrors([
                'url' => 'We could not start this scan right now. Please try again in a few minutes.',
            ]);
        }

        if ($request->boolean('stayOnPage')) {
            return back();
        }

        return redirect()->route('audit.progress', [
            'id' => $audit->crawler_id,
        ]);
    }
}
