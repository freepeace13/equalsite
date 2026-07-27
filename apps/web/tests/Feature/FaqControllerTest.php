<?php

test('the faq page renders for guests', function () {
    $this->get(route('faq'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('faq'));
});
