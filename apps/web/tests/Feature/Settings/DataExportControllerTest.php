<?php

use App\Mail\UserDataExportMail;
use App\Models\User;
use App\Value\Status;
use Illuminate\Support\Facades\Mail;

test('guests are redirected to login when exporting data', function () {
    $this->post(route('profile.export-data'))
        ->assertRedirect(route('login'));
});

test('a user can email themselves a data export', function () {
    Mail::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-export-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->post(route('profile.export-data'))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    Mail::assertSent(UserDataExportMail::class, function (UserDataExportMail $mail) use ($user, $audit) {
        return $mail->hasTo($user->email)
            && $mail->export['account']['email'] === $user->email
            && $mail->export['audits'][0]['domain'] === $audit->domain;
    });
});
