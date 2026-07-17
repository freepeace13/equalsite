# Crawler Artifact Pull-Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the push-based `callbackUrl` artifact delivery (crawler-worker POSTs a zip to Laravel's `/api/crawler/callback`) with a pull-based model: the crawler-worker zips artifacts and exposes them at `GET /api/v1/download/:auditId`; Laravel's `AuditStatusSubscriber::handleAuditCompleted` downloads, extracts, and queues violation processing when it observes the `audit.completed` event.

**Architecture:** `services/playwright-spider` already has the crawler-side half scaffolded (`artifactService.ts`, `downloadArtifactsController.ts`, the `/download/:auditId` route) and already compresses artifacts *before* publishing `audit.completed` — that part just needs its dead `callbackUrl` plumbing removed. `apps/web` has the download-related contracts stubbed (`Spider::download()`) but `SpiderClient::download()` is still broken (it tries to `->json()`-decode a zip) and `AuditStatusSubscriber::handleAuditCompleted` doesn't call it yet. This plan fixes the Laravel download path, wires the subscriber, and deletes every `callbackUrl`/`urlCallback`/`/api/crawler/callback` code path and doc reference left over from the old push model.

**Tech Stack:** Laravel 13 (Pest 4, Mockery), Express 5 + BullMQ (Vitest 4), shared types in `@equalsite/types` (tsup).

## Global Constraints

- Every PHP file you touch: run `vendor/bin/pint --dirty --format agent` before considering the task done (per `apps/web/CLAUDE.md`).
- Every TS file you touch in `services/playwright-spider`: it must pass `pnpm typecheck` from that directory.
- `packages/types` dist output is **committed to git** — any change to `src/` must be followed by `pnpm --filter @equalsite/types build` and the resulting `dist/` diff staged too.
- Do not hand-edit anything under `apps/web/resources/js/actions/` or `apps/web/resources/js/routes/` — those are Wayfinder-generated; regenerate with `php artisan wayfinder:generate` instead.
- No new abstractions beyond what's needed to delete the old callback path and wire the new download path — this is a refactor, not a redesign.

---

### Task 1: Drop `callbackUrl` from the shared `CreateAuditRequestBody` contract

**Files:**
- Modify: `packages/types/src/node/api.ts`
- Modify (generated, run build): `packages/types/dist/index.d.ts`, `packages/types/dist/index.d.mts`, `packages/types/dist/index.js`, `packages/types/dist/index.mjs`, `packages/types/dist/index.js.map`

**Interfaces:**
- Produces: `CreateAuditRequestBody` now has shape `{ urls: string[]; options: AuditOptions }` (no `callbackUrl`). Every later task that constructs or validates this payload (Tasks 2, 6) must match this shape.

- [ ] **Step 1: Remove the field**

In `packages/types/src/node/api.ts`, change:

```ts
export type CreateAuditRequestBody = {
    urls: string[];
    callbackUrl: string;
    options: AuditOptions;
}
```

to:

```ts
export type CreateAuditRequestBody = {
    urls: string[];
    options: AuditOptions;
}
```

- [ ] **Step 2: Rebuild the package**

Run: `pnpm --filter @equalsite/types build`
Expected: tsup regenerates `dist/index.{js,mjs,d.ts,d.mts}` with no `callbackUrl` in the `CreateAuditRequestBody` type.

- [ ] **Step 3: Typecheck consumers so far**

Run: `pnpm --filter @equalsite/types typecheck`
Expected: PASS (no consumers are touched yet, this just confirms the package itself is clean).

- [ ] **Step 4: Commit**

```bash
git add packages/types/src/node/api.ts packages/types/dist
git commit -m "types: drop callbackUrl from CreateAuditRequestBody"
```

---

### Task 2: Strip `callbackUrl`/`urlCallback` from the crawler-api create-audit path

**Files:**
- Modify: `services/playwright-spider/src/audit/entities/audit.ts`
- Modify: `services/playwright-spider/src/audit/repositories/auditRepository.ts`
- Modify: `services/playwright-spider/src/audit/actions/createAudit.ts`
- Modify: `services/playwright-spider/src/app/controllers/createAuditController.ts`
- Modify: `services/playwright-spider/src/app/validators/auditValidators.ts`
- Modify (test): `services/playwright-spider/src/app/validators/auditValidators.test.ts`

**Interfaces:**
- Consumes: `CreateAuditRequestBody` from Task 1 (`{ urls, options }`, no `callbackUrl`).
- Produces: `AuditRepository.create()` now takes `Pick<AuditEntity, 'urls' | 'options'>`. `createAuditAction(auditRepository)` — no `secretKey` param, `run({ urls, options })` — no `urlCallback`. `AuditEntity.urlCallback`, `.artifact`, and `.downloadToken` are all removed here (`artifact`/`downloadToken` are unused scaffolding from the same abandoned callback-token design, confirmed via repo-wide grep to have zero readers) — no other task references them.

- [ ] **Step 1: Update the failing validator test first**

In `services/playwright-spider/src/app/validators/auditValidators.test.ts`, remove `callbackUrl` from the shared fixture and delete the three `callbackUrl`-specific test cases. Replace lines 21-29 (the `validAuditBody` const) with:

```ts
const validAuditBody = {
    urls: ['https://example.com'],
    options: {
        maxPages: 5,
        enqueueLinks: true,
        enqueueStrategy: 'same-domain',
    },
};
```

Then delete these three `it(...)` blocks entirely (currently at lines 97-124):

```ts
        it("rejects a missing callbackUrl", async () => {
            const { callbackUrl: _callbackUrl, ...rest } = validAuditBody;
            const response = await postAudit(rest);
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'callbackUrl',
                message: 'callbackUrl is required and must be a string.',
            });
        });

        it("accepts a callbackUrl pointing at an internal hostname without a TLD", async () => {
            const response = await postAudit({ ...validAuditBody, callbackUrl: 'http://web/api/crawler/callback' });

            expect(response.status).toBe(202);
        });

        it("rejects a callbackUrl that is not a valid URL", async () => {
            const response = await postAudit({ ...validAuditBody, callbackUrl: 'not-a-url' });
            const payload = await response.json() as ErrorPayload;

            expect(response.status).toBe(400);
            expect(payload.errors).toContainEqual({
                field: 'callbackUrl',
                message: 'callbackUrl must be a valid URL.',
            });
        });
```

- [ ] **Step 2: Run the test to see it fail against the still-unmodified validator**

Run: `pnpm --filter @equalsite/playwright-spider test auditValidators`
Expected: FAIL — `"rejects an empty urls array"` and similar still pass, but nothing forces failure yet since the validator still just ignores the extra `callbackUrl` field when absent... actually with `callbackUrl` still `.isString().withMessage(...)` **required**, `"accepts a fully valid payload"` will now FAIL (400, missing callbackUrl) because the fixture no longer sends it. Confirm that specific failure.

- [ ] **Step 3: Remove the `callbackUrl` validation rule**

In `services/playwright-spider/src/app/validators/auditValidators.ts`, delete this block (lines 15-20):

```ts
    body('callbackUrl')
        .isString()
        .withMessage('callbackUrl is required and must be a string')
        .bail()
        .isURL({ require_tld: false, require_protocol: true })
        .withMessage('callbackUrl must be a valid URL'),

```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `pnpm --filter @equalsite/playwright-spider test auditValidators`
Expected: PASS, all remaining cases green.

- [ ] **Step 5: Remove `urlCallback` and the dead `artifact`/`downloadToken` fields from `AuditEntity`**

Replace `services/playwright-spider/src/audit/entities/audit.ts` in full:

```ts
import type { AuditOptions } from "@equalsite/types";
import Status from "../value/status";


interface Attributes {
    id: string;
    urls: string[];
    status: Status;
    options: AuditOptions;
    createdAt: number;
};

class AuditEntity {
    id: string;
    urls: string[];
    status: Status;
    error?: string;
    options: AuditOptions;

    createdAt: number;

    constructor(attributes: Attributes) {
        this.id = attributes.id;
        this.urls = attributes.urls;
        this.status = attributes.status;
        this.createdAt = attributes.createdAt;
        this.options = attributes.options;
    }

    toString(): string {
        return JSON.stringify({
            id: this.id,
            urls: this.urls,
            status: this.status,
            createdAt: this.createdAt,
            options: this.options
        });
    }

    static make(attributes: Attributes): AuditEntity {
        return new AuditEntity(attributes);
    }

    static fromString(value: string): AuditEntity {
        const parsed = JSON.parse(value) as Omit<Attributes, 'status'> & {
            status: Status | { value: Status['value'] };
        };

        const statusValue = typeof parsed.status === 'string'
            ? parsed.status
            : parsed.status instanceof Status
                ? parsed.status.value
                : parsed.status.value;

        return new AuditEntity({
            ...parsed,
            status: Status.make(statusValue),
        });
    }

    markAsCancelled(): this {
        const cancelled = Status.cancelled();

        if (!this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${cancelled.value}' is not allowed.`);
        }

        this.status = cancelled;

        return this;
    }

    markAsCompleted(): this {
        const completed = Status.completed();

        if (!this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${completed.value}' is not allowed.`);
        }

        this.status = completed;

        return this;
    }

    markAsFailed(reason?: string): this {
        const failed = Status.failed();

        if (!this.status.is('active')) {
            throw new Error(`Status change from '${this.status.value}' to '${failed.value}' is not allowed.`);
        }

        this.status = failed;
        this.error = reason;

        return this;
    }

    markAsActive(): this {
        const active = Status.active();

        if (!this.status.is('waiting')) {
            throw new Error(`Status change from '${this.status.value}' to '${active.value}' is not allowed.`);
        }

        this.status = active;

        return this;
    }
}

export default AuditEntity;
```

- [ ] **Step 6: Update the repository interface**

In `services/playwright-spider/src/audit/repositories/auditRepository.ts`, change:

```ts
    create(attributes: Pick<AuditEntity, 'urls' | 'urlCallback' | 'options'>): Promise<AuditEntity>;
```

to:

```ts
    create(attributes: Pick<AuditEntity, 'urls' | 'options'>): Promise<AuditEntity>;
```

(`services/playwright-spider/src/app/adapters/redisAuditRepository.ts` needs no change — its `create()` just spreads whatever attributes it's given.)

- [ ] **Step 7: Remove `urlCallback` and the callback-probe functions from the create-audit action**

Replace `services/playwright-spider/src/audit/actions/createAudit.ts` in full:

```ts
import type { AuditOptions } from "@equalsite/types";
import type { AuditRepository } from "../repositories/auditRepository";

export interface ICreatedAuditAction {
    run: (params: {
        urls: string[];
        options: AuditOptions
    }) => Promise<string>;
}

export const createAuditAction = (
    auditRepository: AuditRepository
): ICreatedAuditAction => ({
    run: async ({
        urls,
        options
    }) => {
        const audit = await auditRepository.create({
            urls,
            options
        });
        return audit.id;
    }
})
```

This deletes `assertCallbackIsNotAuditEndpoint` and `validateCallbackUrl` entirely — they had no other callers (confirmed via repo grep) and their only purpose was probing the now-removed `callbackUrl`.

- [ ] **Step 8: Update the controller to match**

Replace `services/playwright-spider/src/app/controllers/createAuditController.ts` in full:

```ts
import type { Request, Response } from "express";
import { auditRepository } from "../adapters/redisAuditRepository";
import { crawlerQueue } from "../services/queue";
import { createAuditAction as createAuditFactory } from "../../audit/actions/createAudit";
import type { CreateAuditRequestBody, CreateAuditResponseData } from "@equalsite/types";

const createAuditAction = createAuditFactory(auditRepository);

export const CreateAuditController = async (
    request: Request<unknown, unknown, CreateAuditRequestBody>,
    response: Response<CreateAuditResponseData>
) => {
    const urls = request.body.urls;
    const options = request.body.options;

    const auditId = await createAuditAction.run({
        urls,
        options
    });

    await crawlerQueue.add('audit', { auditId }, { jobId: auditId });

    return response.status(202).json({
        id: auditId,
        options,
    });
}
```

(The `import * as Config from '../../config'` line is dropped — it was only there to pass `Config.secretKey` into the factory, which no longer takes it.)

- [ ] **Step 9: Typecheck and run the full crawler test suite**

Run: `pnpm --filter @equalsite/playwright-spider typecheck && pnpm --filter @equalsite/playwright-spider test`
Expected: both PASS.

- [ ] **Step 10: Commit**

```bash
git add services/playwright-spider/src/audit/entities/audit.ts \
        services/playwright-spider/src/audit/repositories/auditRepository.ts \
        services/playwright-spider/src/audit/actions/createAudit.ts \
        services/playwright-spider/src/app/controllers/createAuditController.ts \
        services/playwright-spider/src/app/validators/auditValidators.ts \
        services/playwright-spider/src/app/validators/auditValidators.test.ts
git commit -m "crawler-api: remove callbackUrl from the create-audit path"
```

---

### Task 3: Remove the now-dead `secretKey` plumbing from the worker orchestration layer

**Files:**
- Modify: `services/playwright-spider/src/audit/actions/runAudit.ts`
- Modify: `services/playwright-spider/src/worker.ts`

**Interfaces:**
- Consumes: nothing new from prior tasks.
- Produces: `createRunAuditAction(auditRepository, eventPublisher, { artifactDirectory, archiveDirectory })` — `secretKey` removed from the config object. `Config.secretKey` itself (in `services/playwright-spider/src/config/index.ts`) is **not** removed — it's still used by `authenticateInternalRequest` middleware to authorize inbound requests (including the new `/download/:auditId` route).

`secretKey` reached `runAudit.ts` only to be forwarded to `createReleaseArtifactsAction`, which was already deleted in an earlier scaffolding pass (`git status` shows it as `D`). It's now an unused destructured variable with no reader — confirm this before editing:

- [ ] **Step 1: Confirm `secretKey` is unused inside `runAudit.ts`**

Run: `grep -n secretKey services/playwright-spider/src/audit/actions/runAudit.ts`
Expected: it appears only in the type declaration and destructure, never referenced in the function body below.

- [ ] **Step 2: Remove it from `runAudit.ts`**

In `services/playwright-spider/src/audit/actions/runAudit.ts`, change the config type and destructure from:

```ts
    config: {
        secretKey: string;
        artifactDirectory: string;
        archiveDirectory: string;
    }
): IRunAuditAction => {
    const {
        artifactDirectory,
        archiveDirectory,
        secretKey
    } = config;
```

to:

```ts
    config: {
        artifactDirectory: string;
        archiveDirectory: string;
    }
): IRunAuditAction => {
    const {
        artifactDirectory,
        archiveDirectory,
    } = config;
```

- [ ] **Step 3: Stop passing it from the worker**

In `services/playwright-spider/src/worker.ts`, change:

```ts
        await createRunAuditAction(
            auditRepository,
            publishEvent,
            {
                artifactDirectory: Config.crawler.artifactDirectory,
                archiveDirectory: Config.crawler.archiveDirectory,
                secretKey: Config.secretKey
            }
        ).run(data.auditId);
```

to:

```ts
        await createRunAuditAction(
            auditRepository,
            publishEvent,
            {
                artifactDirectory: Config.crawler.artifactDirectory,
                archiveDirectory: Config.crawler.archiveDirectory,
            }
        ).run(data.auditId);
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @equalsite/playwright-spider typecheck`
Expected: PASS — this also catches it if `secretKey` turns out to have a reader you missed in Step 1 (TS would error on the missing config property).

- [ ] **Step 5: Commit**

```bash
git add services/playwright-spider/src/audit/actions/runAudit.ts services/playwright-spider/src/worker.ts
git commit -m "crawler-worker: drop dead secretKey plumbing left over from the callback release action"
```

---

### Task 4: Fix `SpiderClient::download()` to return raw bytes instead of `.json()`-decoding a zip

**Files:**
- Modify: `apps/web/app/Contracts/Spider.php`
- Modify: `apps/web/app/Support/Spider/SpiderClient.php`
- Modify (test): `apps/web/tests/Unit/Support/Spider/SpiderClientTest.php`

**Interfaces:**
- Produces: `Spider::download(string $id): string` — returns the raw zip bytes. Task 6 (`AuditStatusSubscriber`) consumes this directly.

Right now `SpiderClient::download()` calls the shared `send()` helper, which unconditionally does `$request()->json()` — that will choke on binary zip content. Fix it by extracting the try/catch into a reusable `attempt()` helper that `send()` and `download()` both use, so error mapping (400 → validation, else → unavailable) stays identical across every Spider method without duplicating the catch blocks.

- [ ] **Step 1: Write the failing tests first**

Leave the existing `spiderOptions()` helper in `apps/web/tests/Unit/Support/Spider/SpiderClientTest.php` untouched for now — it still calls the two-argument `SpiderOptions::make('https://example.com', 'http://web/api/crawler/callback')`, which is still the real signature until Task 5 changes it. (Task 5 removes the `callbackUrl` param from `SpiderOptions::make()` and updates this fixture to match — doing it here too would break the `create`/`cancel` tests with an unrelated `ArgumentCountError` before Task 5 has landed.)

Append these three tests at the end of the file instead — they don't use `spiderOptions()`:

```php
test('download returns the raw response body on success', function () {
    Http::fake([
        '*/api/v1/download/*' => Http::response('zip-bytes', 200),
    ]);

    $result = (new SpiderClient)->download('crawler-123');

    expect($result)->toBe('zip-bytes');
});

test('download throws an unavailable exception when the crawler-api cannot be reached', function () {
    Http::fake([
        '*/api/v1/download/*' => Http::failedConnection(),
    ]);

    try {
        (new SpiderClient)->download('crawler-123');
        $this->fail('Expected SpiderUnavailableException to be thrown.');
    } catch (SpiderUnavailableException $e) {
        expect($e->status)->toBeNull();
    }
});

test('download throws an unavailable exception on a non-validation error response', function () {
    Http::fake([
        '*/api/v1/download/*' => Http::response('Not Found', 404),
    ]);

    try {
        (new SpiderClient)->download('crawler-123');
        $this->fail('Expected SpiderUnavailableException to be thrown.');
    } catch (SpiderUnavailableException $e) {
        expect($e->status)->toBe(404);
    }
});
```

- [ ] **Step 2: Run to confirm the new tests fail**

Run: `cd apps/web && php artisan test --compact --filter=SpiderClientTest`
Expected: FAIL — `download returns the raw response body on success` fails because `SpiderClient::download()` currently calls `->json()` on a non-JSON body (throws or returns `null`, not `'zip-bytes'`).

- [ ] **Step 3: Add the return type to the contract**

In `apps/web/app/Contracts/Spider.php`, change:

```php
    public function download(string $id);
```

to:

```php
    public function download(string $id): string;
```

- [ ] **Step 4: Refactor `SpiderClient` to extract raw bytes for `download()`**

Replace `apps/web/app/Support/Spider/SpiderClient.php` in full:

```php
<?php

namespace App\Support\Spider;

use App\Contracts\Spider;
use App\Exceptions\Spider\SpiderUnavailableException;
use App\Exceptions\Spider\SpiderValidationException;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class SpiderClient implements Spider
{
    public function cancel(string $id): array
    {
        return $this->send(fn () => Http::spider()->delete("audit/{$id}"));
    }

    public function ping(): array
    {
        return $this->send(fn () => Http::spider()->get('ping'));
    }

    public function download(string $id): string
    {
        return $this->attempt(fn () => Http::spider()->get("download/{$id}")->body());
    }

    public function create(SpiderOptions $options): array
    {
        return $this->send(fn () => Http::spider()->post('audit', $options->toArray()));
    }

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    protected function send(Closure $request): array
    {
        return $this->attempt(fn () => $request()->json());
    }

    /**
     * @throws SpiderValidationException
     * @throws SpiderUnavailableException
     */
    protected function attempt(Closure $callback): mixed
    {
        try {
            return $callback();
        } catch (RequestException $e) {
            throw $e->response->status() === 400
                ? SpiderValidationException::fromResponse($e)
                : SpiderUnavailableException::fromResponse($e);
        } catch (ConnectionException $e) {
            throw SpiderUnavailableException::fromConnectionFailure($e);
        }
    }
}
```

(Dropped the unused `use Illuminate\Support\Facades\Log;` import and the commented-out debug line while touching this file — dead weight in a file being fully rewritten anyway.)

- [ ] **Step 5: Run the tests again to confirm everything passes**

Run: `cd apps/web && php artisan test --compact --filter=SpiderClientTest`
Expected: PASS, all tests including the pre-existing `create`/`cancel` ones (the `attempt()` extraction must not change their behavior).

- [ ] **Step 6: Format**

Run: `cd apps/web && vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/Contracts/Spider.php apps/web/app/Support/Spider/SpiderClient.php apps/web/tests/Unit/Support/Spider/SpiderClientTest.php
git commit -m "spider: return raw bytes from SpiderClient::download instead of json-decoding a zip"
```

---

### Task 5: Remove `callbackUrl` from `SpiderOptions` and `CreateAudit`

**Files:**
- Modify: `apps/web/app/Support/Spider/SpiderOptions.php`
- Modify: `apps/web/app/Actions/Audit/CreateAudit.php`
- Modify: `apps/web/config/services.php`
- Modify: `apps/web/.env.example`
- Modify: `.env.example` (repo root)

**Interfaces:**
- Consumes: nothing new.
- Produces: `SpiderOptions::make(array|string $urls): static` and `SpiderOptions::fromArray(array $array): static` — no `callbackUrl` param. `SpiderOptions->toArray()` returns `{ urls, options }`, matching `CreateAuditRequestBody` from Task 1.

Note: `apps/web/tests/Unit/Support/Spider/SpiderClientTest.php`'s `spiderOptions()` fixture still calls the current two-argument `SpiderOptions::make()` — Step 2 below updates it to the one-argument form in the same commit as the signature change, so the file is never left in a state where the fixture and the method disagree.

- [ ] **Step 1: Remove `callbackUrl` from `SpiderOptions`**

Replace `apps/web/app/Support/Spider/SpiderOptions.php` in full:

```php
<?php

namespace App\Support\Spider;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;

class SpiderOptions implements Arrayable
{
    protected array $urls = [];

    protected bool $enqueueLinks = true;

    protected EnqueueStrategy $enqueueStrategy;

    protected int $maxPages = 50;

    protected ?int $maxDepth = null;

    protected array $includeGlobs = [];

    protected array $excludeGlobs = [];

    public function __construct(array $urls)
    {
        $this->urls = $urls;
        $this->enqueueStrategy = EnqueueStrategy::SameDomain;
    }

    /**
     * @param  string | list<int, string>  $urls
     */
    public static function make($urls): static
    {
        return new static(
            urls: is_string($urls) ? [$urls] : $urls,
        );
    }

    public static function fromArray(array $array): static
    {
        return tap(new static(
            urls: $array['urls'],
        ), function ($instance) use ($array) {
            if ($options = Arr::get($array, 'options', false)) {
                $instance->setOptions($options);
            }
        });
    }

    public function addUrl(string $url): self
    {
        if (! in_array($url, $this->urls)) {
            $this->urls[] = $url;
        }

        return $this;
    }

    public function getUrls(): array
    {
        return $this->urls;
    }

    public function getOptions(): array
    {
        return [
            'maxPages' => $this->getMaxPages(),
            'enqueueLinks' => $this->getEnqueueLinks(),
            'enqueueStrategy' => $this->getEnqueueStrategy(),
            'maxDepth' => $this->getMaxDepth(),
            'includeGlobs' => $this->getIncludeGlobs(),
            'excludeGlobs' => $this->getExcludeGlobs(),
        ];
    }

    public function setOptions(array $options): self
    {
        foreach ($options as $name => $value) {
            $this->setOption($name, $value);
        }

        return $this;
    }

    public function setOption(string $name, mixed $value): self
    {
        return value(match ($name) {
            'maxPages' => fn () => $this->setMaxPages($value),
            'enqueueLinks' => fn () => $this->setEnqueueLinks($value),
            'enqueueStrategy' => fn () => $this->setEnqueueStrategy($value),
            'maxDepth' => fn () => $this->setMaxDepth($value),
            'includeGlobs' => fn () => $this->setIncludeGlobs($value),
            'excludeGlobs' => fn () => $this->setExcludeGlobs($value),
            default => $this
        });
    }

    public function setMaxPages(int $value): self
    {
        $this->maxPages = $value;

        return $this;
    }

    public function getMaxPages(): int
    {
        return $this->maxPages;
    }

    public function setEnqueueLinks(bool $enable = true): self
    {
        $this->enqueueLinks = $enable;

        return $this;
    }

    public function getEnqueueLinks(): bool
    {
        return $this->enqueueLinks;
    }

    /**
     * @param  EnqueueStrategy|string  $value
     */
    public function setEnqueueStrategy($value): self
    {
        if (is_string($value)) {
            $value = EnqueueStrategy::from($value);
        }

        $this->enqueueStrategy = $value;

        return $this;
    }

    public function getEnqueueStrategy(): string
    {
        return $this->enqueueStrategy->value;
    }

    public function setMaxDepth(?int $value): self
    {
        $this->maxDepth = $value;

        return $this;
    }

    public function getMaxDepth(): ?int
    {
        return $this->maxDepth;
    }

    public function setIncludeGlobs(array $value): self
    {
        $this->includeGlobs = $value;

        return $this;
    }

    public function getIncludeGlobs(): array
    {
        return $this->includeGlobs;
    }

    public function setExcludeGlobs(array $value): self
    {
        $this->excludeGlobs = $value;

        return $this;
    }

    public function getExcludeGlobs(): array
    {
        return $this->excludeGlobs;
    }

    public function toArray(): array
    {
        return [
            'urls' => $this->getUrls(),
            'options' => $this->getOptions(),
        ];
    }
}
```

- [ ] **Step 2: Update the test fixture to match the new signature**

In `apps/web/tests/Unit/Support/Spider/SpiderClientTest.php`, change:

```php
function spiderOptions(): SpiderOptions
{
    return SpiderOptions::make('https://example.com', 'http://web/api/crawler/callback');
}
```

to:

```php
function spiderOptions(): SpiderOptions
{
    return SpiderOptions::make('https://example.com');
}
```

- [ ] **Step 3: Stop building a callback URL in `CreateAudit`**

In `apps/web/app/Actions/Audit/CreateAudit.php`, remove this line:

```php
        $callbackUrl = config('services.crawler.callback_base_url').route('api.crawler.callback', absolute: false);

```

and change:

```php
        $response = $this->spider->create(
            SpiderOptions::make(
                urls: [$url],
                callbackUrl: $callbackUrl
            )->setOptions([
```

to:

```php
        $response = $this->spider->create(
            SpiderOptions::make([$url])->setOptions([
```

- [ ] **Step 4: Remove the config key**

In `apps/web/config/services.php`, remove this line from the `'crawler'` array:

```php
        'callback_base_url' => env('CRAWLER_CALLBACK_BASE_URL', 'http://web'),
```

- [ ] **Step 5: Remove the env var from both example files**

In `apps/web/.env.example`, remove:

```
# URL the crawler service uses to reach this app for its callback probe/webhook.
# Docker Compose: http://web (service DNS). Non-Docker local dev: match APP_URL.
CRAWLER_CALLBACK_BASE_URL=http://127.0.0.1:8000
```

In the repo-root `.env.example`, remove the corresponding line:

```
CRAWLER_CALLBACK_BASE_URL=http://127.0.0.1:8000
```

- [ ] **Step 6: Run the affected test suites**

Run: `cd apps/web && php artisan test --compact --filter=CreateAuditTest && php artisan test --compact --filter=SpiderClientTest`
Expected: both PASS.

- [ ] **Step 7: Format**

Run: `cd apps/web && vendor/bin/pint --dirty --format agent`

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/Support/Spider/SpiderOptions.php apps/web/app/Actions/Audit/CreateAudit.php \
        apps/web/config/services.php apps/web/.env.example .env.example \
        apps/web/tests/Unit/Support/Spider/SpiderClientTest.php
git commit -m "spider: stop sending callbackUrl when queueing audits"
```

---

### Task 6: Wire `AuditStatusSubscriber::handleAuditCompleted` to download, extract, and queue processing

**Files:**
- Modify: `apps/web/app/Listeners/AuditStatusSubscriber.php`
- Create: `apps/web/tests/Unit/Listeners/AuditStatusSubscriberTest.php`

**Interfaces:**
- Consumes: `Spider::download(string $id): string` (Task 4), `UnzipCrawlerArtifacts::unzip(string $crawlId, string $zipFilePath): void` (existing, `apps/web/app/Actions/Audit/UnzipCrawlerArtifacts.php`), `ProcessAuditArtifacts::dispatch(string $crawlerId)` (existing job).
- Produces: `AuditStatusSubscriber` now has a constructor `__construct(protected Spider $spider, protected UnzipCrawlerArtifacts $unzip)` — Laravel's container auto-resolves both when it instantiates the listener per dispatch (already true for `[AuditStatusSubscriber::class, 'handleAuditCompleted']`-style listener registration, no `EventServiceProvider` change needed).

Failure handling: if the download/extract step throws, `report()` the exception but still mark the audit `Completed` — the crawl itself genuinely finished; only artifact ingestion failed, which is diagnosable from logs. This mirrors how the old `CrawlerCallbackController` treated unzip/dispatch failures (caught, reported, response still `200 ok`).

- [ ] **Step 1: Write the failing tests first**

Create `apps/web/tests/Unit/Listeners/AuditStatusSubscriberTest.php`:

```php
<?php

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
use App\Events\Audit\AuditCompleted;
use App\Jobs\ProcessAuditArtifacts;
use App\Listeners\AuditStatusSubscriber;
use App\Models\User;
use App\Value\RedisStreamData;
use App\Value\Status;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

function completedEvent(string $crawlerId): AuditCompleted
{
    return new AuditCompleted(new RedisStreamData(
        id: '1-0',
        streamName: 'equalsite:crawler:events',
        type: 'audit.completed',
        payload: ['auditId' => $crawlerId],
        version: '1',
        timestamp: now()->getTimestampMs(),
    ));
}

test('handleAuditCompleted downloads, extracts, and queues processing of the artifacts', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-123', 'acme.com', Status::Started);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->with('crawler-123')->andReturn('zip-bytes');

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldReceive('unzip')->once()->with('crawler-123', Mockery::type('string'));

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-123'));

    Bus::assertDispatched(ProcessAuditArtifacts::class, fn ($job) => $job->crawlerId === 'crawler-123');

    expect($audit->fresh()->status)->toBe(Status::Completed);
});

test('handleAuditCompleted still marks the audit completed when artifact download fails', function () {
    Bus::fake();

    $user = User::factory()->create();
    $audit = makeUserAudit($user, 'crawler-456', 'acme.com', Status::Started);

    $spider = Mockery::mock(Spider::class);
    $spider->shouldReceive('download')->once()->andThrow(new Exception('boom'));

    $unzip = Mockery::mock(UnzipCrawlerArtifacts::class);
    $unzip->shouldNotReceive('unzip');

    (new AuditStatusSubscriber($spider, $unzip))->handleAuditCompleted(completedEvent('crawler-456'));

    Bus::assertNotDispatched(ProcessAuditArtifacts::class);
    expect($audit->fresh()->status)->toBe(Status::Completed);
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd apps/web && php artisan test --compact --filter=AuditStatusSubscriberTest`
Expected: FAIL — `AuditStatusSubscriber`'s constructor doesn't accept arguments yet (`new AuditStatusSubscriber($spider, $unzip)` errors), and `handleAuditCompleted` never calls `Spider::download` or dispatches `ProcessAuditArtifacts`.

- [ ] **Step 3: Implement the listener**

Replace `apps/web/app/Listeners/AuditStatusSubscriber.php` in full:

```php
<?php

namespace App\Listeners;

use App\Actions\Audit\UnzipCrawlerArtifacts;
use App\Contracts\Spider;
use App\Events\Audit\AuditCompleted;
use App\Events\Audit\AuditFailed;
use App\Events\Audit\AuditStarted;
use App\Jobs\ProcessAuditArtifacts;
use App\Models\Audit;
use App\Value\Status;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Throwable;

class AuditStatusSubscriber implements ShouldQueue
{
    public function __construct(
        protected Spider $spider,
        protected UnzipCrawlerArtifacts $unzip,
    ) {}

    public function handleAuditStarted(AuditStarted $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Started,
            'started_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    public function handleAuditFailed(AuditFailed $event): void
    {
        $this->updateAudit($event->crawlerId(), [
            'status' => Status::Failed,
            'failure_reason' => $event->payload()['error'] ?? '',
        ]);
    }

    public function handleAuditCompleted(AuditCompleted $event): void
    {
        $crawlerId = $event->crawlerId();

        try {
            $this->processArtifacts($crawlerId);
        } catch (Throwable $e) {
            report($e);
        }

        $this->updateAudit($crawlerId, [
            'status' => Status::Completed,
            'completed_at' => $this->carbonTimestamp($event->timestamp()),
        ]);
    }

    protected function processArtifacts(string $crawlerId): void
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'audit-artifact-');

        try {
            File::put($zipPath, $this->spider->download($crawlerId));
            $this->unzip->unzip($crawlerId, $zipPath);
        } finally {
            File::delete($zipPath);
        }

        ProcessAuditArtifacts::dispatch($crawlerId);
    }

    protected function carbonTimestamp(int $timestamp)
    {
        return Carbon::createFromTimestampMs($timestamp);
    }

    protected function updateAudit(string $crawlerId, array $attributes): void
    {
        DB::transaction(function () use ($crawlerId, $attributes) {
            $audit = Audit::where('crawler_id', $crawlerId)
                ->lockForUpdate()
                ->first();

            if ($audit) {
                $audit->update($attributes);
            }
        });
    }

    public function subscribe(Dispatcher $events): void
    {
        $events->listen(
            AuditStarted::class,
            [AuditStatusSubscriber::class, 'handleAuditStarted']
        );

        $events->listen(
            AuditFailed::class,
            [AuditStatusSubscriber::class, 'handleAuditFailed']
        );

        $events->listen(
            AuditCompleted::class,
            [AuditStatusSubscriber::class, 'handleAuditCompleted']
        );
    }
}
```

- [ ] **Step 4: Run the tests again to confirm they pass**

Run: `cd apps/web && php artisan test --compact --filter=AuditStatusSubscriberTest`
Expected: PASS.

- [ ] **Step 5: Run the full Pest suite to catch any listener-resolution regression**

Run: `cd apps/web && php artisan test --compact`
Expected: PASS (this listener is resolved via the container elsewhere in the app — e.g. wherever `crawler:listen` dispatches domain events — confirm nothing else instantiates `AuditStatusSubscriber` with the old no-arg constructor).

- [ ] **Step 6: Format**

Run: `cd apps/web && vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit**

```bash
git add apps/web/app/Listeners/AuditStatusSubscriber.php apps/web/tests/Unit/Listeners/AuditStatusSubscriberTest.php
git commit -m "listeners: download and process crawler artifacts on audit.completed"
```

---

### Task 7: Delete the dead `/api/crawler/callback` route, controller, and middleware

**Files:**
- Delete: `apps/web/app/Http/Controllers/Api/CrawlerCallbackController.php`
- Delete: `apps/web/app/Http/Middleware/CrawlerMiddleware.php`
- Modify: `apps/web/routes/api.php`
- Regenerate (do not hand-edit): `apps/web/resources/js/actions/App/Http/Controllers/Api/CrawlerCallbackController.ts`, `apps/web/resources/js/routes/api/crawler/index.ts`

**Interfaces:**
- Consumes: nothing (this is pure deletion).
- Produces: no more `/api/crawler/callback` route; `apps/web/routes/api.php` is empty (still required to exist — `apps/web/bootstrap/app.php` references it by path).

`ProcessAuditArtifacts` and `UnzipCrawlerArtifacts` are **not** deleted — Task 6 wired them into the new path, they're still live.

- [ ] **Step 1: Confirm nothing else references the route or middleware**

Run: `cd apps/web && grep -rn "CrawlerCallbackController\|CrawlerMiddleware\|api.crawler.callback" app routes tests resources/js --include="*.php" --include="*.ts" --include="*.tsx" | grep -v resources/js/actions | grep -v resources/js/routes`
Expected: no output (the only remaining hits should be inside the generated Wayfinder files, which Step 4 regenerates).

- [ ] **Step 2: Delete the controller and middleware**

```bash
git rm apps/web/app/Http/Controllers/Api/CrawlerCallbackController.php apps/web/app/Http/Middleware/CrawlerMiddleware.php
```

- [ ] **Step 3: Empty the route file**

Replace `apps/web/routes/api.php` in full:

```php
<?php
```

- [ ] **Step 4: Regenerate Wayfinder output**

Run: `cd apps/web && php artisan wayfinder:generate`
Expected: `apps/web/resources/js/actions/App/Http/Controllers/Api/CrawlerCallbackController.ts` and `apps/web/resources/js/routes/api/crawler/index.ts` are deleted (no backend route maps to them anymore), and `apps/web/resources/js/routes/api/index.ts` / the `actions/App/Http/Controllers/Api/index.ts` barrel no longer reference them. If the command doesn't remove stale files on its own, delete them manually:

```bash
git rm -r apps/web/resources/js/actions/App/Http/Controllers/Api/CrawlerCallbackController.ts \
          apps/web/resources/js/routes/api/crawler
```

Then check the barrels for now-dangling exports:

Run: `cd apps/web && grep -n "crawler\|CrawlerCallback" resources/js/routes/api/index.ts resources/js/actions/App/Http/Controllers/Api/index.ts`

If either barrel still imports/re-exports the deleted modules, remove those lines by hand (barrels are simple re-export lists, not full codegen — Wayfinder regenerates the leaf route/action files, not necessarily every intermediate barrel).

- [ ] **Step 5: Typecheck the frontend**

Run: `cd apps/web && pnpm typecheck`
Expected: PASS — confirms nothing in `resources/js` still imports the deleted generated modules.

- [ ] **Step 6: Run the full Pest suite**

Run: `cd apps/web && php artisan test --compact`
Expected: PASS.

- [ ] **Step 7: Format**

Run: `cd apps/web && vendor/bin/pint --dirty --format agent`

- [ ] **Step 8: Commit**

```bash
git add -A apps/web/routes/api.php apps/web/app/Http/Controllers/Api apps/web/app/Http/Middleware apps/web/resources/js
git commit -m "routes: remove the dead /api/crawler/callback endpoint and its generated wayfinder output"
```

---

### Task 8: Delete the orphaned `packages/tsconfig/dist` artifact and update docs

**Files:**
- Delete: `packages/tsconfig/dist/` (entire directory)
- Modify: `services/playwright-spider/README.md`
- Modify: `CLAUDE.md` (repo root)

**Interfaces:** none — this task is docs and a leftover-artifact deletion, no code contracts change.

`packages/tsconfig` has no `src/` directory at all (confirmed: `find packages/tsconfig/src` returns nothing; `package.json` only exports `.json` config files). `packages/tsconfig/dist/` is a stray, fully orphaned build artifact from an unrelated old layout — it contains a stale `callbackUrl` reference (`packages/tsconfig/dist/src/api/crawler/validation.d.ts`) and nothing in the repo imports from it (confirmed via repo-wide grep for `tsconfig/dist` and `@equalsite/tsconfig` import paths). It qualifies as exactly the kind of "orphaned file, callbackUrl-related" the acceptance criteria calls out.

- [ ] **Step 1: Re-confirm nothing references it (safety check before deleting)**

Run: `grep -rln "tsconfig/dist" --include="*.ts" --include="*.tsx" --include="*.json" . 2>/dev/null | grep -v node_modules`
Expected: no output.

- [ ] **Step 2: Delete it**

```bash
git rm -r packages/tsconfig/dist
```

- [ ] **Step 3: Update the crawler-api README's callback references**

In `services/playwright-spider/README.md`:

Replace the intro line:

```
Events stream to Laravel through **Redis Streams**; completed artifact datasets are delivered via an HTTP callback.
```

with:

```
Events stream to Laravel through **Redis Streams**; Laravel pulls completed artifact datasets via an authenticated download endpoint.
```

Replace the Responsibilities table row:

```
| Artifact delivery | Zip Crawlee datasets → multipart POST to Laravel callback |
```

with:

```
| Artifact delivery | Zip Crawlee datasets → served at `GET /download/:auditId`, deleted once Laravel downloads it |
```

Replace the API table:

```
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ping` | Health check |
| `POST` | `/audit` | Enqueue a new audit |
| `DELETE` | `/audit/:auditId` | Cancel a queued or running audit |
```

with:

```
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ping` | Health check |
| `POST` | `/audit` | Enqueue a new audit |
| `DELETE` | `/audit/:auditId` | Cancel a queued or running audit |
| `GET` | `/download/:auditId` | Download the zipped artifact archive for a completed audit; deletes it once the download finishes |
```

Replace the create-audit request example:

```json
{
  "urls": ["https://example.com"],
  "callbackUrl": "http://web/api/crawler/callback",
  "options": {
    "maxPages": 10,
    "enqueueStrategy": "SameDomain"
  }
}
```

with:

```json
{
  "urls": ["https://example.com"],
  "options": {
    "maxPages": 10,
    "enqueueStrategy": "SameDomain"
  }
}
```

Replace the "Crawl & scan flow" diagram:

```
POST /audit
  │
  ├─ Validate callback URL (probe request)
  ├─ Store AuditEntity in Redis
  └─ BullMQ: add job { auditId }  (job ID = audit ID for cancel-by-id)

Worker picks job
  │
  ├─ auditService.startAudit → Redis stream: audit.started
  ├─ PlaywrightCrawler.run(urls)
  │    └─ per page (handleAuditPageRequest):
  │         ├─ AxeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
  │         ├─ processAxeResult → Crawlee dataset + audit.page.completed
  │         └─ audit.progress event
  ├─ auditService.completeAudit → audit.completed
  ├─ releaseArtifacts: zip datasets → POST callback (multipart + Bearer)
  └─ performCleanUp: teardown crawler, delete Redis record, remove zip
```

with:

```
POST /audit
  │
  ├─ Store AuditEntity in Redis
  └─ BullMQ: add job { auditId }  (job ID = audit ID for cancel-by-id)

Worker picks job
  │
  ├─ auditService.startAudit → Redis stream: audit.started
  ├─ PlaywrightCrawler.run(urls)
  │    └─ per page (handleAuditPageRequest):
  │         ├─ AxeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
  │         ├─ processAxeResult → Crawlee dataset + audit.page.completed
  │         └─ audit.progress event
  ├─ artifactService.compress → zip Crawlee dataset to storage/archives/{auditId}.zip
  ├─ auditService.completeAudit → audit.completed
  └─ performCleanUp: teardown crawler, delete Redis record

Laravel (AuditStatusSubscriber, on audit.completed)
  │
  ├─ GET /download/:auditId (Bearer CRAWLER_SECRET) → streams the zip
  ├─ artifactService.cleanup (crawler-api) → deletes the zip once the download completes
  └─ UnzipCrawlerArtifacts + ProcessAuditArtifacts job → parses axe JSON into audit_violations
```

Replace the "Key source files" tree's `audit/` section:

```
    ├── actions/
    │   ├── crawlerFactory.ts          # PlaywrightCrawler config
    │   ├── handleAuditPageRequest.ts  # axe-core per page
    │   ├── processAxeResult.ts        # Violation normalization
    │   ├── runAudit.ts                # Orchestration
    │   └── releaseArtifacts.ts        # Zip + callback
    └── services/auditService.ts       # Status transitions + events
```

with:

```
    ├── actions/
    │   ├── crawlerFactory.ts          # PlaywrightCrawler config
    │   ├── handleAuditPageRequest.ts  # axe-core per page
    │   ├── processAxeResult.ts        # Violation normalization
    │   └── runAudit.ts                # Orchestration
    └── services/
        ├── auditService.ts            # Status transitions + events
        └── artifactService.ts         # Zip/compress/cleanup of Crawlee datasets
```

Replace the "Communication with Laravel" table and the paragraph beneath it:

```
| Direction | Mechanism | Auth |
|-----------|-----------|------|
| Laravel → this service | HTTP `POST/DELETE /api/v1/audit` | Bearer `CRAWLER_SECRET` |
| This service → Laravel (events) | Redis Stream `equalsite:crawler:events` | — |
| This service → Laravel (data) | HTTP `POST /api/crawler/callback` | Bearer `CRAWLER_SECRET` |

Laravel's `php artisan crawler:listen` consumes the Redis Stream and maps events to domain events + WebSocket broadcasts. The callback delivers a zip containing Crawlee dataset JSON that Laravel's `ProcessAuditArtifacts` job parses into violation records.
```

with:

```
| Direction | Mechanism | Auth |
|-----------|-----------|------|
| Laravel → this service | HTTP `POST/DELETE /api/v1/audit`, `GET /api/v1/download/:auditId` | Bearer `CRAWLER_SECRET` |
| This service → Laravel (events) | Redis Stream `equalsite:crawler:events` | — |

Laravel's `php artisan crawler:listen` consumes the Redis Stream and maps events to domain events + WebSocket broadcasts. On `audit.completed`, Laravel's `AuditStatusSubscriber` downloads the zipped Crawlee dataset from `GET /download/:auditId` and dispatches `ProcessAuditArtifacts` to parse it into violation records.
```

Replace the Storage table row:

```
| `storage/archives/{auditId}.zip` | Zipped artifacts for callback (deleted after delivery) |
```

with:

```
| `storage/archives/{auditId}.zip` | Zipped artifacts awaiting download (deleted once Laravel downloads it) |
```

In "Design decisions", replace:

```
**Crawlee datasets as the artifact format** — Crawlee's built-in dataset storage produces structured JSON per page. Zipping and POSTing this to Laravel keeps the crawler stateless after cleanup — Laravel owns persistence.
```

with:

```
**Crawlee datasets as the artifact format** — Crawlee's built-in dataset storage produces structured JSON per page. Zipping this for Laravel to pull (rather than pushing it) keeps the crawler stateless after cleanup — Laravel owns persistence, and the crawler doesn't need to track callback delivery success/retries.
```

Replace the Event types table row:

```
| `audit.completed` | All pages scanned, artifacts released |
```

with:

```
| `audit.completed` | All pages scanned, artifact zip ready for download |
```

- [ ] **Step 4: Update the root `CLAUDE.md` architecture description**

In `CLAUDE.md`, replace:

```
Laravel `php artisan crawler:listen` blocks on XREADGROUP, turns stream events into
Laravel domain events, and broadcasts them over Soketi (Pusher-protocol WebSocket) to the browser.
On completion the worker zips Crawlee datasets and POSTs them (multipart, Bearer auth) to
Laravel's `/api/crawler/callback`, which queues `ProcessAuditArtifacts` to parse axe JSON and
upsert `audit_violations`.
```

with:

```
Laravel `php artisan crawler:listen` blocks on XREADGROUP, turns stream events into
Laravel domain events, and broadcasts them over Soketi (Pusher-protocol WebSocket) to the browser.
The worker zips Crawlee datasets locally before publishing `audit.completed`. Laravel's
`AuditStatusSubscriber::handleAuditCompleted` reacts to that event by pulling the zip from the
crawler-api (`GET /api/v1/download/:auditId`, Bearer `CRAWLER_SECRET`), extracting it via
`UnzipCrawlerArtifacts`, and queueing `ProcessAuditArtifacts` to parse axe JSON and upsert
`audit_violations`. The crawler-api deletes its copy of the zip once the download completes.
```

Also check the "Cross-service HTTP calls" bullet a few lines below and confirm it still reads correctly — it currently says:

```
Cross-service HTTP calls (`Laravel → crawler-api`, `crawler-worker → Laravel callback`) are all
authenticated with a shared `CRAWLER_SECRET` bearer token.
```

Replace with:

```
Cross-service HTTP calls (`Laravel → crawler-api`, including the artifact download) are all
authenticated with a shared `CRAWLER_SECRET` bearer token.
```

- [ ] **Step 5: Final repo-wide sweep for leftover references**

Run: `grep -rn "callbackUrl\|urlCallback\|callback_base_url\|CRAWLER_CALLBACK_BASE_URL\|api/crawler/callback\|CrawlerCallbackController\|CrawlerMiddleware\|releaseArtifacts" --include="*.php" --include="*.ts" --include="*.tsx" --include="*.md" . 2>/dev/null | grep -v node_modules | grep -v vendor | grep -v "/dist/"`
Expected: no output. If anything remains, it's a spot this plan missed — fix it before moving on.

- [ ] **Step 6: Commit**

```bash
git add packages/tsconfig services/playwright-spider/README.md CLAUDE.md
git commit -m "docs: align playwright-spider README and CLAUDE.md with the pull-download artifact flow"
```

---

### Task 9: Full-stack verification

**Files:** none — verification only.

- [ ] **Step 1: Run every test suite touched by this plan**

Run: `pnpm --filter @equalsite/types build && pnpm --filter @equalsite/playwright-spider typecheck && pnpm --filter @equalsite/playwright-spider test && cd apps/web && vendor/bin/pint --test && php artisan test --compact && pnpm typecheck`
Expected: everything PASSES.

- [ ] **Step 2: Full repo lint**

Run: `pnpm lintcheck`
Expected: PASS.

- [ ] **Step 3: Confirm the git status is clean except intended changes**

Run: `git status`
Expected: no unexpected untracked files (e.g. leftover `tempnam()` artifacts from a manual test run, `.phpunit.cache`, etc. — check `.gitignore` covers anything odd before committing).
