<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureMonetizationEnabled
{
    /**
     * Blocks the billing routes while monetization is disabled — every scan
     * already runs unrestricted via PlanLimits, so subscribing or viewing
     * the billing page would be misleading. billing.cancel is intentionally
     * not routed through this middleware, so an existing subscriber can
     * always cancel regardless of the flag.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (config('plans.enabled')) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Billing is currently disabled.'], 403);
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => 'Billing is currently disabled.']);

        return redirect()->route('dashboard');
    }
}
