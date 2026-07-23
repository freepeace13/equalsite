<?php

it('trusts X-Forwarded-Proto from the reverse proxy so requests are recognized as secure', function () {
    $this->get('/up', ['X-Forwarded-Proto' => 'https']);

    expect(request()->isSecure())->toBeTrue();
});

it('does not treat a plain http request as secure', function () {
    $this->get('/up');

    expect(request()->isSecure())->toBeFalse();
});
