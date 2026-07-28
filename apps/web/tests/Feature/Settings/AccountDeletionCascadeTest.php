<?php

use App\Models\Audit;
use App\Models\User;
use App\Models\Violation;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Support\Facades\Storage;

test('deleting an account removes audits, violations, and stored crawler artifacts', function () {
    Storage::fake('audit_artifacts');

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-delete-1', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');

    Storage::disk('audit_artifacts')->put("audits/{$audit->crawler_id}/result.json", '{}');

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    expect($user->fresh())->toBeNull();
    expect(Audit::find($audit->id))->toBeNull();
    expect(Violation::find($violation->id))->toBeNull();
    expect(Storage::disk('audit_artifacts')->exists("audits/{$audit->crawler_id}/result.json"))->toBeFalse();
});
