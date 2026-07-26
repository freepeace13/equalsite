<?php

use App\Models\Audit;
use App\Models\User;
use App\Models\Violation;
use App\Value\Impact;
use App\Value\Status;

test('deleting an audit cascades to delete its violations', function () {
    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-cascade-1', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');

    $audit->delete();

    expect(Audit::find($audit->id))->toBeNull();
    expect(Violation::find($violation->id))->toBeNull();
});
