<?php

use App\Models\Audit;
use App\Models\User;
use App\Models\Violation;
use App\Value\Impact;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

function makeUserAudit(
    User $user,
    string $crawlerId,
    string $domain,
    Status $status,
    array $customData = []
): Audit {
    $audit = Audit::create([
        'user_id' => $user->id,
        'crawler_id' => $crawlerId,
        'url' => "https://{$domain}",
        'domain' => $domain,
        'status' => $status,
    ]);

    // 'custom_data' isn't mass-assignable (see Audit::$fillable), so it's set
    // the same way the app itself writes it — via setCustomData.
    foreach ($customData as $key => $value) {
        $audit->setCustomData($key, $value);
    }

    return $audit;
}

/**
 * Every real POST to /audit now requires the self-certification checkbox
 * (AuditCreateRequest::rules()); this keeps that boilerplate out of every
 * individual test while still letting tests override or omit it to test
 * the validation rule itself.
 */
function validAuditPayload(array $overrides = []): array
{
    return array_merge(['confirmedAuthorized' => true], $overrides);
}

function makeAuditViolation(
    Audit $audit,
    Impact $impact,
    string $ruleId = 'color-contrast'
): Violation {
    return Violation::create([
        'audit_id' => $audit->id,
        'rule_id' => $ruleId,
        'impact_level' => $impact,
        'description' => 'Elements must meet minimum color contrast ratio requirements',
        'failure_summary' => 'Fix any of the following',
        'help_url' => 'https://dequeuniversity.com/rules/axe/4.7/color-contrast',
        'nodes' => [],
    ]);
}

// Mirrors App\Actions\CreateAuditViolation's node-recording pattern.
function addViolationNode(Violation $violation, string $url, string $target, string $html): void
{
    $violation->nodes->sync(['url' => $url, 'target' => $target, 'html' => $html]);
    $violation->save();
}
