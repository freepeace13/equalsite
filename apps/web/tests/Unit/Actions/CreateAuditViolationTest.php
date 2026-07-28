<?php

use App\Actions\CreateAuditViolation;
use App\Contracts\ArtifactRepository;
use App\Models\User;
use App\Value\AxeItem;
use App\Value\AxeNode;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function makeAxeItem(array $overrides = []): AxeItem
{
    return new AxeItem(
        id: $overrides['id'] ?? 'color-contrast',
        tags: ['wcag2aa'],
        description: 'Elements must meet minimum color contrast ratio requirements',
        help: 'Elements must meet minimum color contrast ratio requirements',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
        nodes: [
            new AxeNode(
                any: [],
                all: [],
                none: [],
                html: '<button class="cta">Buy</button>',
                target: ['button.cta'],
                impact: 'serious',
                failureSummary: 'Fix any of the following',
            ),
        ],
        impact: 'serious',
        screenshotPath: $overrides['screenshotPath'] ?? null,
    );
}

test('the first occurrence of a rule copies its screenshot into the public disk', function () {
    Storage::fake('local');
    Storage::fake('public');

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-screenshot-1', 'acme.com', Status::Completed);

    Storage::disk('local')->put('audits/crawler-screenshot-1/screenshots/0__color-contrast.png', 'fake-png-bytes');

    $violation = makeAxeItem(['screenshotPath' => 'screenshots/0__color-contrast.png']);

    (new CreateAuditViolation(app(ArtifactRepository::class)))
        ->create($audit, 'https://acme.com/', $violation);

    $model = $audit->violations()->where('rule_id', 'color-contrast')->firstOrFail();

    expect($model->screenshot_path)->not->toBeNull()
        ->and(Storage::disk('public')->exists($model->screenshot_path))->toBeTrue()
        ->and(Storage::disk('public')->get($model->screenshot_path))->toBe('fake-png-bytes');
});

test('a second page with the same rule does not overwrite the first screenshot', function () {
    Storage::fake('local');
    Storage::fake('public');

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-screenshot-2', 'acme.com', Status::Completed);

    Storage::disk('local')->put('audits/crawler-screenshot-2/screenshots/0__color-contrast.png', 'first-page-bytes');
    Storage::disk('local')->put('audits/crawler-screenshot-2/screenshots/1__color-contrast.png', 'second-page-bytes');

    $action = new CreateAuditViolation(app(ArtifactRepository::class));

    $action->create($audit, 'https://acme.com/', makeAxeItem(['screenshotPath' => 'screenshots/0__color-contrast.png']));
    $action->create($audit, 'https://acme.com/about', makeAxeItem(['screenshotPath' => 'screenshots/1__color-contrast.png']));

    $model = $audit->violations()->where('rule_id', 'color-contrast')->firstOrFail();

    expect(Storage::disk('public')->get($model->screenshot_path))->toBe('first-page-bytes');
});

test('a violation with no screenshotPath leaves screenshot_path null', function () {
    Storage::fake('local');
    Storage::fake('public');

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-screenshot-3', 'acme.com', Status::Completed);

    (new CreateAuditViolation(app(ArtifactRepository::class)))
        ->create($audit, 'https://acme.com/', makeAxeItem());

    $model = $audit->violations()->where('rule_id', 'color-contrast')->firstOrFail();

    expect($model->screenshot_path)->toBeNull();
});
