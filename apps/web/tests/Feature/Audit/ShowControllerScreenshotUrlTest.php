<?php

// apps/web/tests/Feature/Audit/ShowControllerScreenshotUrlTest.php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

test('a violation with a screenshot gets a signed local URL when the disk driver is local', function () {
    Storage::fake('audit_artifacts');

    // Storage::fake() swaps in a fresh local driver with its own default
    // buildTemporaryUrlsUsing callback, replacing the one AuditArtifactsServiceProvider
    // registered at boot — re-apply it so the fake exercises the same signed-route path
    // production/local dev actually uses.
    Storage::disk('audit_artifacts')->buildTemporaryUrlsUsing(
        fn (string $path, DateTimeInterface $expiration) => URL::temporarySignedRoute(
            'audit-artifacts.show',
            $expiration,
            ['path' => $path]
        )
    );

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-1', 'acme.com', Status::Completed);

    Storage::disk('audit_artifacts')->put('audits/crawler-show-1/screenshots/0__color-contrast.png', 'fake-png-bytes');

    $audit->violations()->create([
        'rule_id' => 'color-contrast',
        'impact_level' => Impact::Serious,
        'description' => 'desc',
        'nodes' => [],
        'help_url' => 'https://example.com',
        'failure_summary' => 'Fix any of the following',
        'screenshot_path' => 'audits/crawler-show-1/screenshots/0__color-contrast.png',
    ]);

    $response = $this->actingAs($user)->get('/audit/crawler-show-1');

    $response->assertOk();
    $screenshotUrl = $response->viewData('page')['props']['report']['violations'][0]['screenshotUrl'];

    expect($screenshotUrl)->toContain('/audit-artifacts/')
        ->and($screenshotUrl)->toContain('signature=');
});

test('the signed local route streams the file and rejects a tampered signature', function () {
    Storage::fake('audit_artifacts');
    Storage::disk('audit_artifacts')->put('audits/crawler-show-2/screenshots/0__color-contrast.png', 'fake-png-bytes');

    $url = URL::temporarySignedRoute(
        'audit-artifacts.show',
        now()->addMinutes(30),
        ['path' => 'audits/crawler-show-2/screenshots/0__color-contrast.png']
    );

    $this->get($url)->assertOk()->assertStreamedContent('fake-png-bytes');

    $this->get($url.'&signature=tampered')->assertForbidden();
});
