<?php

use App\Models\AuditPage;
use App\Models\User;
use App\Services\HealthScoreCalculator;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('maxPossibleImpactPenalty scales with the number of scanned pages', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-health-score', 'acme.com', Status::Completed);

    AuditPage::create(['audit_id' => $audit->id, 'url' => 'https://acme.com/', 'status' => 'completed', 'last_activity_at' => now()]);
    AuditPage::create(['audit_id' => $audit->id, 'url' => 'https://acme.com/about', 'status' => 'completed', 'last_activity_at' => now()]);

    $calculator = new HealthScoreCalculator;
    $reflection = new ReflectionMethod($calculator, 'maxPossibleImpactPenalty');
    $reflection->setAccessible(true);

    expect($reflection->invoke($calculator, $audit->fresh(), Impact::Critical))
        ->toBe(2 * Impact::Critical->weight());
});
