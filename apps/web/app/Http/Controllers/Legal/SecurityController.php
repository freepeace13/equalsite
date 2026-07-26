<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('legal/security', [
            'lastUpdated' => '2026-07-26',
            'contactEmail' => config('services.support.email'),
        ]);
    }
}
