<?php

use App\Models\Audit;
use App\Models\User;
use App\Value\Status;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// This repo doesn't test migrations directly (no existing precedent under
// tests/ for schema-level assertions) — these verify the two behavioral
// consequences of the 2026_07_16_165808_make_user_id_required_on_audits_table
// migration (NOT NULL + cascadeOnDelete) indirectly, the way the rest of the
// suite verifies model/DB behavior.
test('an audit cannot be created without a user_id', function () {
    Audit::create([
        'crawler_id' => 'no-owner',
        'url' => 'https://example.com',
        'domain' => 'example.com',
        'status' => Status::Queued,
    ]);
})->throws(QueryException::class);

test('deleting a user cascades to delete their audits', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'owned-by-deleted-user', 'acme.com', Status::Completed);

    $user->delete();

    $this->assertDatabaseMissing('audits', ['id' => $audit->id]);
});
