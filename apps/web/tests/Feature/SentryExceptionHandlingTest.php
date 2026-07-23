<?php

use Illuminate\Support\Facades\Route;

it('still renders the normal error response for an unhandled exception with the Sentry integration wired in', function () {
    Route::get('/__test-throws', function () {
        throw new RuntimeException('boom');
    });

    $response = $this->get('/__test-throws');

    $response->assertServerError();
});
