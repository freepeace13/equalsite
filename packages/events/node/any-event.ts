import type { AuditCancelled } from './types/audit-cancelled';
import type { AuditCompleted } from './types/audit-completed';
import type { AuditFailed } from './types/audit-failed';
import type { AuditPageCompleted } from './types/audit-page-completed';
import type { AuditPageFailed } from './types/audit-page-failed';
import type { AuditPageSkipped } from './types/audit-page-skipped';
import type { AuditPageStarted } from './types/audit-page-started';
import type { AuditProgress } from './types/audit-progress';
import type { AuditQueued } from './types/audit-queued';
import type { AuditStarted } from './types/audit-started';
import type { CrawlerTelemetry } from './types/crawler-telemetry';

/** Every crawler event envelope this package knows about. */
export type AnyEvent =
    | AuditCancelled
    | AuditCompleted
    | AuditFailed
    | AuditPageCompleted
    | AuditPageFailed
    | AuditPageSkipped
    | AuditPageStarted
    | AuditProgress
    | AuditQueued
    | AuditStarted
    | CrawlerTelemetry;

/**
 * Plain `Pick<Union, K>` does not distribute over a union — it collapses `type`
 * and `payload` into loosely-related unions, losing the discriminant guarantee.
 * This distributes Pick across each member first, so the result stays a proper
 * discriminated union keyed on `type`.
 */
type DistributivePick<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never;

/** What a caller must supply to `Bus.publish()` — Bus fills in `version`/`timestamp`. */
export type PublishableEvent = DistributivePick<AnyEvent, 'type' | 'payload'>;
