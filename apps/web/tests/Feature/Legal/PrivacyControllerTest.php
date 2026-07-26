<?php

test('the privacy policy page renders for guests', function () {
    $this->get(route('legal.privacy'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/privacy'));
});
