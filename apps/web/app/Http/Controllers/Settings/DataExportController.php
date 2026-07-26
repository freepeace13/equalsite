<?php

namespace App\Http\Controllers\Settings;

use App\Actions\User\GenerateUserDataExport;
use App\Http\Controllers\Controller;
use App\Mail\UserDataExportMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class DataExportController extends Controller
{
    public function store(Request $request, GenerateUserDataExport $action): RedirectResponse
    {
        $user = $request->user();
        $export = $action->generate($user);

        Mail::send(new UserDataExportMail($user->name, $user->email, $export));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __("We've emailed you a copy of your data."),
        ]);

        return to_route('profile.edit');
    }
}
