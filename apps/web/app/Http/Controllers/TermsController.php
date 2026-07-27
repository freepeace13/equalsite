<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class TermsController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('terms', [
            'lastUpdated' => '2026-07-26',
        ]);
    }
}
