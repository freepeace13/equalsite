<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class RefundPolicyController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('refund-policy', [
            'lastUpdated' => '2026-07-26',
        ]);
    }
}
