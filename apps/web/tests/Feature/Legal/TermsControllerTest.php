<?php

test('the terms of service page renders for guests', function () {
    $this->get(route('legal.terms'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/terms'));
});
