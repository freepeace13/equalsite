<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RefundPolicyController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('legal/refund-policy', [
            'lastUpdated' => '2026-07-26',
        ]);
    }
}
