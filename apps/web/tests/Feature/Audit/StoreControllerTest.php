<?php

use App\Contracts\Spider;
use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use App\Models\Audit;
use App\Models\DomainBlock;
use App\Models\User;
use App\Support\Spider\SpiderOptions;
use App\Value\Status;
use GuzzleHttp\Psr7\Response as Psr7Response;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;

uses(RefreshDatabase::class);

function fakeSpider(string $crawlerId = 'crawler-123'): void
{
    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andReturn(['id' => $crawlerId]);
}

/**
 * Same as fakeSpider(), but captures the SpiderOptions the action actually
 * built — the only way to assert the plan-clamped maxPages/maxDepth the
 * crawler was told to use, since CreateAudit doesn't return them.
 */
function fakeSpiderCapturing(string $crawlerId, ?SpiderOptions &$capturedOptions): void
{
    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->withArgs(function (SpiderOptions $options) use (&$capturedOptions) {
            $capturedOptions = $options;

            return true;
        })
        ->andReturn(['id' => $crawlerId]);
}

test('guests are redirected to login', function () {
    $this->post(route('audit.store'), ['url' => 'https://example.com'])
        ->assertRedirect(route('login'));
});

test('an authenticated user submitting a url creates an audit owned by their own account', function () {
    fakeSpider('crawler-owned');
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com']),
    );

    $audit = Audit::findById('crawler-owned');

    expect($audit)->not->toBeNull()
        ->and($audit->user_id)->toBe($user->id);

    $response->assertRedirect(route('audit.progress', ['id' => 'crawler-owned']));
});

test('the page cap is clamped to the free plan limit regardless of requested settings', function () {
    $capturedOptions = null;
    fakeSpiderCapturing('crawler-free-pages', $capturedOptions);
    $user = User::factory()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com']),
    );

    expect($capturedOptions->getOptions()['maxPages'])->toBe(50);
});

test('the page cap is clamped to the pro plan limit', function () {
    $capturedOptions = null;
    fakeSpiderCapturing('crawler-pro-pages', $capturedOptions);
    $user = User::factory()->pro()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com']),
    );

    expect($capturedOptions->getOptions()['maxPages'])->toBe(100);
});

test('crawl depth requested beyond the free plan is silently clamped down to shallow', function () {
    $capturedOptions = null;
    fakeSpiderCapturing('crawler-free-depth', $capturedOptions);
    $user = User::factory()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com', 'crawlDepth' => 5]),
    );

    expect($capturedOptions->getOptions()['maxDepth'])->toBe(1);
});

test('pro accounts get their requested crawl depth honored', function () {
    $capturedOptions = null;
    fakeSpiderCapturing('crawler-pro-depth', $capturedOptions);
    $user = User::factory()->pro()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com', 'crawlDepth' => 5]),
    );

    expect($capturedOptions->getOptions()['maxDepth'])->toBe(5);
});

test('a pro account can immediately re-scan the same domain without being blocked by the re-scan rule', function () {
    fakeSpider('crawler-pro-first');
    $user = User::factory()->pro()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    // Simulate the first crawl finishing so the "1 in-flight audit" cap
    // doesn't block the 2nd submission — we're isolating the re-scan-frequency
    // rule here, not the in-flight rule (covered separately in AuditPolicyTest).
    Audit::findById('crawler-pro-first')->forceFill(['status' => Status::Completed])->save();

    fakeSpider('crawler-pro-second');

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    $response->assertRedirect(route('audit.progress', ['id' => 'crawler-pro-second']));
    expect(Audit::findById('crawler-pro-second'))->not->toBeNull();
});

/**
 * CreateAudit::assertSiteCapAllowed() excludes domains the account already
 * owns from the site-cap count — only a genuinely new domain beyond the cap
 * is denied. Without that check, the site-cap count would be permanently >= 1
 * after a free account's first completed audit, blocking every future
 * re-scan of that same site before assertRescanAllowed() is ever reached.
 */
test('a free account resubmitting to its own existing site is allowed by the site cap and reaches the re-scan rule', function () {
    fakeSpider('crawler-free-first');
    $user = User::factory()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    Audit::findById('crawler-free-first')->forceFill([
        'status' => Status::Completed,
        'created_at' => now()->subHours(30), // well outside the rescan window
    ])->save();

    fakeSpider('crawler-free-second');

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    $response->assertRedirect(route('audit.progress', ['id' => 'crawler-free-second']));
    expect(Audit::findById('crawler-free-second'))->not->toBeNull();
});

test('a free account resubmitting to its own existing site within the rescan window is blocked by the re-scan rule, not the site cap', function () {
    fakeSpider('crawler-free-recent');
    $user = User::factory()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    Audit::findById('crawler-free-recent')->forceFill(['status' => Status::Completed])->save();

    // No 2nd Spider::create expectation is set — the request should never
    // reach the crawler if it's denied by the re-scan rule.
    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    $response->assertRedirect()->assertSessionHasErrors('url');
});

test('a spider validation failure is reported and surfaced as a form error, not a 500', function () {
    $user = User::factory()->create();

    $response = new Response(new Psr7Response(400, [], json_encode([
        'error' => 'Invalid request body',
        'message' => 'The request failed validation.',
        'errors' => [['field' => 'options.maxPages', 'message' => 'options.maxPages is required.']],
    ])));

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andThrow(SpiderValidationException::fromResponse(new RequestException($response)));

    $result = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com']),
    );

    $result->assertRedirect()->assertSessionHasErrors('url');
    expect(Audit::query()->count())->toBe(0);
});

test('a spider connection failure is reported and surfaced as a form error, not a 500', function () {
    $user = User::factory()->create();

    test()->mock(Spider::class)
        ->shouldReceive('create')
        ->once()
        ->andThrow(SpiderUnavailableException::fromConnectionFailure(new ConnectionException('Connection refused')));

    $result = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.com']),
    );

    $result->assertRedirect()->assertSessionHasErrors('url');
    expect(Audit::query()->count())->toBe(0);
});

test('a free account adding a genuinely new site beyond its site cap is denied with a validation-style error, not a 403', function () {
    fakeSpider('crawler-free-site-one');
    $user = User::factory()->create();

    $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://acme.com']),
    );

    Audit::findById('crawler-free-site-one')->forceFill([
        'status' => Status::Completed,
        'created_at' => now()->subHours(30),
    ])->save();

    // No Spider::create expectation for a 2nd domain — the request should
    // never reach the crawler if it's denied by the site cap.
    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://example.org']),
    );

    $response->assertRedirect()->assertSessionHasErrors('url');
});

test('submitting without confirming authorization is rejected', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        ['url' => 'https://example.com', 'confirmedAuthorized' => false],
    );

    $response->assertSessionHasErrors('confirmedAuthorized');
    expect(Audit::query()->count())->toBe(0);
});

test('submitting without the confirmedAuthorized field at all is rejected', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        ['url' => 'https://example.com'],
    );

    $response->assertSessionHasErrors('confirmedAuthorized');
    expect(Audit::query()->count())->toBe(0);
});

test('submitting a url for a blocked domain is denied with a validation-style error, not a 403', function () {
    DomainBlock::create(['domain' => 'blocked-example.com']);
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(
        route('audit.store'),
        validAuditPayload(['url' => 'https://blocked-example.com']),
    );

    $response->assertRedirect()->assertSessionHasErrors('url');
    expect(Audit::query()->count())->toBe(0);
});
