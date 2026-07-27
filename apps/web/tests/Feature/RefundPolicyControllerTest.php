<?php

test('the refund policy page renders for guests', function () {
    $this->get(route('refund'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('refund-policy'));
});
