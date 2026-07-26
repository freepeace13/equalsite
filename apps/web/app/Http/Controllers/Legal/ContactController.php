<?php

namespace App\Http\Controllers\Legal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Legal\ContactRequest;
use App\Mail\ContactMessageMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('legal/contact');
    }

    public function store(ContactRequest $request): RedirectResponse
    {
        Mail::send(new ContactMessageMail(
            $request->string('name')->toString(),
            $request->string('email')->toString(),
            $request->string('message')->toString(),
        ));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __("Thanks — we've received your message and will reply soon."),
        ]);

        return to_route('legal.contact.edit');
    }
}
