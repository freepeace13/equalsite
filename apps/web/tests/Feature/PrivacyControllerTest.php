<?php

test('the privacy policy page renders for guests', function () {
    $this->get(route('privacy-policy'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('privacy-policy'));
});
