<?php

test('the refund policy page renders for guests', function () {
    $this->get(route('legal.refund'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/refund-policy'));
});
