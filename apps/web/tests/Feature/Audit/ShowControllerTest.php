<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Models\Violation;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->get(route('audit.show', $audit->crawler_id))->assertRedirect(route('login'));
});

test('breadcrumb context defaults to the audits index when there is no from param', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', null),
        );
});

test('breadcrumb context is set to site when navigated from the site history', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id).'?from=site')
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', 'site'),
        );
});

test('unrecognized from values are ignored', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-1', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id).'?from=somewhere-else')
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('from', null),
        );
});

test('scannedUrls prop is a list of page objects', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-pages', 'acme.com', Status::Completed);

    AuditPage::create([
        'audit_id' => $audit->id,
        'url' => 'https://acme.com/',
        'status' => 'completed',
        'last_activity_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->has('report.scannedUrls', 1)
            ->where('report.scannedUrls.0.url', 'https://acme.com/'),
        );
});

test('violations prop resolves a screenshot url when a screenshot was captured', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-screenshot', 'acme.com', Status::Completed);

    Violation::create([
        'audit_id' => $audit->id,
        'rule_id' => 'color-contrast',
        'impact_level' => Impact::Serious,
        'description' => 'Elements must meet minimum color contrast ratio thresholds',
        'failure_summary' => 'Fix any of the following',
        'help_url' => 'https://dequeuniversity.com/rules/axe/4.11/color-contrast',
        'nodes' => [],
        'screenshot_path' => 'audits/crawler-show-screenshot/0__color-contrast.png',
    ]);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->has('report.violations', 1)
            ->where('report.violations.0.screenshotUrl', fn (?string $url) => str_contains($url, '0__color-contrast.png')),
        );
});

test('scanSettings prop reflects the stored spider request parameters', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-settings', 'acme.com', Status::Completed, [
        'request_params' => [
            'urls' => ['https://acme.com'],
            'options' => [
                'maxPages' => 25,
                'enqueueLinks' => true,
                'enqueueStrategy' => 'same-domain',
                'maxDepth' => 3,
                'includeGlobs' => ['/blog/*'],
                'excludeGlobs' => ['/admin/*'],
                'captureScreenshot' => true,
            ],
        ],
    ]);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('report.scanSettings', [
                'maxPages' => 25,
                'maxDepth' => 3,
                'enqueueStrategy' => 'same-domain',
                'includeGlobs' => ['/blog/*'],
                'excludeGlobs' => ['/admin/*'],
                'captureScreenshot' => true,
            ]),
        );
});

test('scanSettings prop is null when no request parameters were recorded', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-show-no-settings', 'acme.com', Status::Completed);

    $this->actingAs($user)
        ->get(route('audit.show', $audit->crawler_id))
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/show')
            ->where('report.scanSettings', null),
        );
});
