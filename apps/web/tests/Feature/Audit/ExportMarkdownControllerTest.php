<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to login', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-export-1', 'acme.com', Status::Completed);

    $this->get(route('audit.export-markdown', $audit->crawler_id))
        ->assertRedirect(route('login'));
});

test('downloads a markdown file for a completed audit', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-export-2', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');
    addViolationNode($violation, 'https://acme.com/', 'img', '<img src="x.png">');

    $response = $this->actingAs($user)
        ->get(route('audit.export-markdown', $audit->crawler_id));

    $response->assertOk()
        ->assertHeader('Content-Type', 'text/markdown; charset=UTF-8')
        ->assertHeader('Content-Disposition', 'attachment; filename="equalsite-acme.com-'.now()->toDateString().'.md"');

    expect($response->getContent())
        ->toContain('image-alt')
        ->toContain('# Accessibility Remediation Spec — acme.com');
});

test('returns 404 for an audit that is not completed', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-export-3', 'acme.com', Status::Started);

    $this->actingAs($user)
        ->get(route('audit.export-markdown', $audit->crawler_id))
        ->assertNotFound();
});
