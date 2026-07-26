<?php

use App\Actions\User\GenerateUserDataExport;
use App\Models\User;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('it exports account info and audit history', function () {
    $user = User::factory()->create(['name' => 'Ada Lovelace']);
    $audit = makeUserAudit($user, 'crawler-export-unit-1', 'acme.com', Status::Completed);
    makeAuditViolation($audit, Impact::Serious, 'color-contrast');

    $export = (new GenerateUserDataExport)->generate($user);

    expect($export['account']['name'])->toBe('Ada Lovelace')
        ->and($export['account']['email'])->toBe($user->email)
        ->and($export['audits'])->toHaveCount(1)
        ->and($export['audits'][0]['domain'])->toBe('acme.com')
        ->and($export['audits'][0]['violations'][0]['rule_id'])->toBe('color-contrast');
});
