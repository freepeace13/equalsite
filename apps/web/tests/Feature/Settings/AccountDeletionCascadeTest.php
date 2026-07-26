<?php

use App\Models\Audit;
use App\Models\User;
use App\Models\Violation;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

test('deleting an account removes audits, violations, and stored crawler artifacts', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-delete-1', 'acme.com', Status::Completed);
    $violation = makeAuditViolation($audit, Impact::Critical, 'image-alt');

    $artifactPath = Storage::path("audits/{$audit->crawler_id}/");
    File::makeDirectory($artifactPath, 0755, true);
    File::put($artifactPath.'result.json', '{}');

    $this->actingAs($user)
        ->delete(route('profile.destroy'), ['password' => 'password'])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/');

    expect($user->fresh())->toBeNull();
    expect(Audit::find($audit->id))->toBeNull();
    expect(Violation::find($violation->id))->toBeNull();
    expect(File::isDirectory($artifactPath))->toBeFalse();
});
