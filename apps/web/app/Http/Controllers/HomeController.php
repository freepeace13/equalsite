<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
        ]);
    }
}
