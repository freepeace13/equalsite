<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('privacy-policy', [
            'lastUpdated' => '2026-07-26',
        ]);
    }
}
