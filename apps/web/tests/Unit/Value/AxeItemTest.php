<?php

use App\Value\AxeItem;

function axeItemArray(array $overrides = []): array
{
    return array_merge([
        'id' => 'color-contrast',
        'impact' => 'serious',
        'tags' => ['wcag2aa'],
        'description' => 'Elements must meet minimum color contrast ratio requirements',
        'help' => 'Elements must meet minimum color contrast ratio requirements',
        'helpUrl' => 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
        'nodes' => [],
    ], $overrides);
}

test('fromArray captures a present screenshotPath', function () {
    $item = AxeItem::fromArray(axeItemArray(['screenshotPath' => 'screenshots/0__color-contrast.png']));

    expect($item->screenshotPath)->toBe('screenshots/0__color-contrast.png');
});

test('fromArray defaults screenshotPath to null when absent', function () {
    $item = AxeItem::fromArray(axeItemArray());

    expect($item->screenshotPath)->toBeNull();
});

test('toArray round-trips screenshotPath', function () {
    $item = AxeItem::fromArray(axeItemArray(['screenshotPath' => 'screenshots/0__color-contrast.png']));

    expect($item->toArray())->toHaveKey('screenshotPath', 'screenshots/0__color-contrast.png');
});
