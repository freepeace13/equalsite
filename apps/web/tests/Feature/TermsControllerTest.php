<?php

test('the terms of service page renders for guests', function () {
    $this->get(route('terms'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('terms'));
});
