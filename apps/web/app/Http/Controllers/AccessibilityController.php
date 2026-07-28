<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AccessibilityController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('accessibility-statement', [
            'lastUpdated' => '2026-07-28',
            'contactEmail' => config('services.support.email'),
        ]);
    }
}
