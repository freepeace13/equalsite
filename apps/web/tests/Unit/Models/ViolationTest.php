<?php

use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('nodes->sync persists a new node and survives a fresh reload', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-violation-1', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');

    addViolationNode($violation, 'https://acme.com/', 'img', '<img src="x.png">');

    $nodes = $violation->fresh()->nodes->toArray();

    expect($nodes)->toHaveCount(1);

    $node = array_values($nodes)[0];

    expect($node['target'])->toBe('img')
        ->and($node['html'])->toBe('<img src="x.png">')
        ->and($node['urls'])->toBe(['https://acme.com/']);
});

test('syncing the same target and html from a second page merges urls onto one node instead of duplicating it', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-violation-2', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');

    addViolationNode($violation, 'https://acme.com/', 'img', '<img src="x.png">');
    addViolationNode($violation->fresh(), 'https://acme.com/about', 'img', '<img src="x.png">');

    $nodes = $violation->fresh()->nodes->toArray();

    expect($nodes)->toHaveCount(1);

    $node = array_values($nodes)[0];

    expect($node['urls'])->toBe(['https://acme.com/', 'https://acme.com/about']);
});
