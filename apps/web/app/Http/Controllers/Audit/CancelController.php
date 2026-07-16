<?php

namespace App\Http\Controllers\Audit;

use App\Actions\Audit\CancelAudit;
use App\Exceptions\Spider\SpiderException;
use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;

class CancelController extends Controller
{
    public function __invoke(Request $request, CancelAudit $action)
    {
        $audit = Audit::query()
            ->where('crawler_id', $request->route('id'))
            ->firstOrFail();

        try {
            $action->cancel($audit);
        } catch (SpiderException $e) {
            report($e);

            return back()->withErrors([
                'audit' => 'We could not cancel this scan right now. Please try again in a few minutes.',
            ]);
        }

        return back();
    }
}
