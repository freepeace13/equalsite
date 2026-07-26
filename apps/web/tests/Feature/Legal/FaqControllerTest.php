<?php

test('the faq page renders for guests', function () {
    $this->get(route('legal.faq'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/faq'));
});
