# @equalsite/events

Shared crawler event contracts for Equalsite, consumed on both sides of the
Node ⇄ PHP boundary described in the root `CLAUDE.md` ("Architecture — how the
two services talk").

The JSON Schema files under `schema/` are the single source of truth. Everything
under `node/types/` and `php/Value/` (plus `php/EventTypeMap.php`) is generated
from them via `quicktype` — do not hand-edit those files, edit the schema and
regenerate instead.

## Layout

- `schema/` — JSON Schema definitions, one file per event type. Source of truth.
- `scripts/generate.mjs` — runs quicktype against `schema/` to produce the
  generated TS and PHP below.
- `node/`
  - `node/types/` — generated TS types (one file per event type) + a barrel
    `index.ts`.
  - `node/any-event.ts` — the `AnyEvent` discriminated union and `PublishableEvent`.
  - `node/bus.ts` — `Bus.publisher()` / `Bus.publish()`, the producer-side façade.
  - `node/publisher.ts` — the transport-agnostic `Publisher` port.
- `php/`
  - `php/Value/` — generated PHP DTOs (one file per event type, namespace
    `EqualSite\Events\Value`).
  - `php/EventTypeMap.php` — generated type-string ⇄ DTO class map.
  - `php/Subscriber.php` — the transport-agnostic `Subscriber` port (consumer side).
  - `php/Bus.php` — `Bus::subscriber()` / `Bus::listen()` / `Bus::consume()`,
    the consumer-side façade.

## Regenerating

```bash
pnpm --filter @equalsite/events run generate
# or, from the PHP side:
composer run generate
```

Adding a new event type means adding a schema file under `schema/`, then
regenerating — this produces the new TS type, PHP DTO, and an `EventTypeMap.php`
entry together, so they can't drift out of sync with each other.
