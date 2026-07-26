<?php

use App\Actions\Audit\GenerateRemediationMarkdown;
use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('generates a heading with domain, audit id, and health score', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-md-1', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'color-contrast');
    addViolationNode($violation, 'https://acme.com/', 'button.cta', '<button class="cta">Go</button>');

    $audit->refresh()->load(['violations', 'pages']);

    $markdown = (new GenerateRemediationMarkdown)->generate($audit);

    expect($markdown)
        ->toContain('# Accessibility Remediation Spec — acme.com')
        ->toContain('Audit: crawler-md-1')
        ->toContain('Health score:');
});

test('groups violations into severity sections in critical to minor order', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-md-2', 'acme.com', Status::Completed);

    $minor = makeAuditViolation($audit, Impact::Minor, 'region');
    addViolationNode($minor, 'https://acme.com/', 'main', '<div>content</div>');

    $critical = makeAuditViolation($audit, Impact::Critical, 'image-alt');
    addViolationNode($critical, 'https://acme.com/', 'img', '<img src="x.png">');

    $audit->refresh()->load(['violations', 'pages']);

    $markdown = (new GenerateRemediationMarkdown)->generate($audit);

    $criticalPos = strpos($markdown, '## Critical');
    $minorPos = strpos($markdown, '## Minor');

    expect($criticalPos)->not->toBeFalse()
        ->and($minorPos)->not->toBeFalse()
        ->and($criticalPos)->toBeLessThan($minorPos)
        ->and($markdown)->not->toContain('## Serious')
        ->and($markdown)->not->toContain('## Moderate');
});

test('renders rule id, description, failure summary, help url, and every affected node', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-md-3', 'acme.com', Status::Completed);

    $violation = makeAuditViolation($audit, Impact::Serious, 'link-name');
    addViolationNode($violation, 'https://acme.com/', 'a.icon-link', '<a class="icon-link"></a>');
    addViolationNode($violation, 'https://acme.com/about', 'a.icon-link', '<a class="icon-link"></a>');

    $audit->refresh()->load(['violations', 'pages']);

    $markdown = (new GenerateRemediationMarkdown)->generate($audit);

    expect($markdown)
        ->toContain('link-name')
        ->toContain('Elements must meet minimum color contrast ratio requirements')
        ->toContain('Fix any of the following')
        ->toContain('https://dequeuniversity.com/rules/axe/4.7/color-contrast')
        ->toContain('a.icon-link')
        ->toContain('<a class="icon-link"></a>')
        ->toContain('https://acme.com/')
        ->toContain('https://acme.com/about');
});

test('falls back to a humanized rule id when plain_english_summary is null', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-md-4', 'acme.com', Status::Completed);

    $violation = makeAuditViolation($audit, Impact::Moderate, 'landmark-one-main');
    addViolationNode($violation, 'https://acme.com/', 'body', '<body></body>');

    $audit->refresh()->load(['violations', 'pages']);

    $markdown = (new GenerateRemediationMarkdown)->generate($audit);

    expect($markdown)->toContain('landmark one main');
});
