<?php

use App\Support\Spider\SpiderOptions;

test('captureScreenshot defaults to true', function () {
    $options = SpiderOptions::make('https://example.com');

    expect($options->getOptions())->toHaveKey('captureScreenshot', true);
});

test('captureScreenshot can be set to false via setOptions', function () {
    $options = SpiderOptions::make('https://example.com')
        ->setOptions(['captureScreenshot' => false]);

    expect($options->getOptions())->toHaveKey('captureScreenshot', false);
});

test('toArray includes captureScreenshot under options', function () {
    $options = SpiderOptions::make('https://example.com');

    expect($options->toArray()['options'])->toHaveKey('captureScreenshot', true);
});
