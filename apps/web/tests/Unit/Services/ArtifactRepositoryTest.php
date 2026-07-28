<?php

use App\Contracts\ArtifactRepository;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class);

test('getAxeResults reads and parses every JSON file under the artifacts prefix', function () {
    Storage::fake('audit_artifacts');

    Storage::disk('audit_artifacts')->put('audits/crawler-1/artifacts/000000001.json', json_encode([
        'auditId' => 'crawler-1',
        'pageUrl' => 'https://acme.com/',
        'violations' => [],
    ]));
    Storage::disk('audit_artifacts')->put('audits/crawler-1/artifacts/000000002.json', json_encode([
        'auditId' => 'crawler-1',
        'pageUrl' => 'https://acme.com/about',
        'violations' => [],
    ]));

    $results = app(ArtifactRepository::class)->getAxeResults('crawler-1');

    expect($results)->toHaveCount(2)
        ->and(collect($results)->pluck('url')->all())->toEqualCanonicalizing([
            'https://acme.com/',
            'https://acme.com/about',
        ]);
});

test('getAxeResults returns an empty array when nothing has been published yet', function () {
    Storage::fake('audit_artifacts');

    $results = app(ArtifactRepository::class)->getAxeResults('crawler-missing');

    expect($results)->toBe([]);
});

test('delete removes the whole audits/{id} prefix', function () {
    Storage::fake('audit_artifacts');

    Storage::disk('audit_artifacts')->put('audits/crawler-2/artifacts/000000001.json', '{}');
    Storage::disk('audit_artifacts')->put('audits/crawler-2/screenshots/0__color-contrast.png', 'bytes');

    app(ArtifactRepository::class)->delete('crawler-2');

    expect(Storage::disk('audit_artifacts')->exists('audits/crawler-2/artifacts/000000001.json'))->toBeFalse()
        ->and(Storage::disk('audit_artifacts')->exists('audits/crawler-2/screenshots/0__color-contrast.png'))->toBeFalse();
});
