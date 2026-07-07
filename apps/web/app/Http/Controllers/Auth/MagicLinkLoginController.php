<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MagicLinkLoginController extends Controller
{
    public function __invoke(Request $request, User $user)
    {
        Auth::login($user);

        $request->session()->regenerate();

        return redirect('/');
    }
}
