# Equalsite — monetization strategy (v2)

This doc covers how Equalsite generates revenue to sustain itself post-MVP. For product behavior see `architecture`, for brand/UI see `style-guide`.

**This version supersedes v1's "queue-priority only" model.** Now that every audit requires an account (see `architecture` section 2), plan-based access limits are added on top of queue priority — see section 1 for why this doesn't reopen the original low-effort reasoning.

---

## 1\. Model: priority-queue \+ access-scope freemium

v1 deliberately avoided feature-gating because it required no new infrastructure beyond a queue-priority field. That reasoning doesn't change — it's just no longer the *only* lever available, because mandatory accounts mean the checks below are basically free to add (a `plan` flag read at request time, not new subsystems):

- **Free** — capped pages per audit, single site per account, standard queue, limited history retention, re-scan frequency capped, crawl depth locked to shallow.  
- **Pro (\~$9–15/mo)** — higher page cap, multi-site, priority queue, unlimited scans, full history, full crawl depth control.

### Free-tier limits (locked)

| Limit | Free | Pro |
| :---- | :---- | :---- |
| Sites per account | 1 | multiple |
| Pages per audit | capped (exact number TBD against server load testing) | higher cap |
| Crawl depth | shallow only | shallow / standard / deep |
| Re-scan frequency | 1 audit per site per 24h | no cap (still 1 in-flight per account) |
| Audit history retention | last 5 audits per site | unlimited |
| Queue priority | standard | priority |

The re-scan-frequency cap does double duty: it protects the standard queue from being hammered (complementing queue-priority monetization rather than duplicating it) and creates natural urgency on its own — no manufactured scare messaging needed (see `style-guide` section 1 on why lawsuit/legal- risk framing was explicitly rejected as an urgency lever).

### Why this combination over either lever alone

- Queue priority alone (v1) still works as the primary lever for people who just want speed.  
- Access-scope limits (site cap, history, depth) target a different kind of user — someone actively managing multiple sites or wanting to see fixes land over time — without requiring any new infrastructure, since the checks piggyback on the same `plan` flag and existing `audits` table.  
- Compute cost still stays flat regardless of subscriber count (crawler concurrency remains capped at 2 Playwright instances) — neither lever forces a server upgrade as subscriber count grows.

## 2\. Implementation approach

Unchanged from v1 for queue priority: **BullMQ job `priority` field** on the existing single queue. Paid job \= `priority: 1`, free job \= `priority: 10`. No second queue, no new orchestration logic.

Access-scope limits are enforced at audit-creation time in the request handler, reading `users.plan`:

- Site cap — reject/redirect to upgrade prompt if a free account's site count would exceed 1\.  
- Page cap / crawl depth — clamp the crawl parameters server-side regardless of what the (now-locked-for-free) advanced settings UI requests.  
- Re-scan frequency — reject with a clear "next scan available at \[time\]" message if within the 24h window for that site.  
- History retention — a query limit on the Site page's history list, not a deletion — old audits aren't destroyed, just not shown past the 5-audit window on free plans.

Guardrails carried forward from v1, unchanged:

- Free-tier starvation trigger (revisit if free-tier wait times regularly exceed a few minutes).  
- Rate-limit to 1 in-flight audit per paid account.  
- Progress page explains queue position honestly (e.g. "3 priority audits ahead of you").

## 3\. Pricing

Unchanged pricing structure from v1, now with the access-scope column added:

| Tier | Price | Included |
| :---- | :---- | :---- |
| Free | $0 | 1 site, capped pages, shallow crawl only, standard queue, last 5 audits/site |
| Pro | \~$9–15/mo | Multiple sites, higher page cap, full crawl depth, priority queue, unlimited scans, full history |

PDF export, scheduled re-scans/regression alerts, and agency/white-label reporting remain phase-2+/phase-3 upsells — not built speculatively ahead of demand, same as v1.

## 4\. Billing

Unchanged from v1: **Paddle via Laravel Cashier** (Cashier Paddle 2.x) as Merchant of Record, handling VAT/sales-tax globally. Webhook endpoint `/paddle/webhook`, signature-verified via `PADDLE_WEBHOOK_SECRET`, handled idempotently. Build against Paddle Sandbox first; vendor account must be approved before going live.

## 5\. Financial model

Unchanged from v1 — fixed costs, break-even math, and funnel scenarios don't shift just because access-scope limits were added on top of queue priority (the added limits don't change server cost, which is what the model is built around):

- Fixed costs: \~$40/mo (Vultr, domain, email/misc).  
- Net revenue per subscriber at $12/mo: ≈ $10.90/mo after Paddle fees.  
- Break-even: 4 subscribers. $100/mo profit: 13\. $300/mo profit: 32\. $500/mo profit: 50\.  
- At 1% conversion, \~400 free scans/month reaches breakeven.  
- Churn caveat unchanged: 5–10%/month is a realistic micro-SaaS range: plan for ongoing acquisition, not a one-time subscriber count.

See v1 for the full funnel table and indie-SaaS context — none of that changes with this revision.

## 6\. Known unknowns / what to instrument from day one

Same three unknowns as v1 (free-scan traffic volume, real conversion rate, real churn rate), plus one new one introduced by this revision:

- **Free-tier limit tightness** — whether the single-site/24h-recheck/5- history combination is the right pressure point, or too restrictive/lax, is itself unmeasured. Instrument site-cap hit rate and re-scan-limit hit rate alongside the existing analytics (scans run, signups, upgrades, churn) so this can be tuned post-launch rather than guessed at now.

## 7\. Phased roadmap

**Phase 1 — this doc's scope:**

1. Add `plan` flag to user accounts (free/pro).  
2. Add `priority` field to BullMQ job creation, driven by plan.  
3. Add access-scope checks at audit-creation time: site cap, page cap, crawl depth clamp, re-scan frequency, history retention query limit.  
4. Extend progress page copy to explain queue position honestly for free users.  
5. Integrate Paddle via Laravel Cashier; one Pro product at \~$9–15/mo.  
6. Instrument analytics (scans run, signups, upgrades, churn, site-cap and re-scan-limit hit rates).

**Phase 2 — once Pro has a paying base:** 7\. PDF/exportable reports (reuse existing Playwright rendering). 8\. Scheduled re-scans \+ regression alerts (existing BullMQ/Redis queue).

**Phase 3 — agency tier, only if phase 2 shows demand:** 9\. Multi-site management beyond the Pro cap, white-label reports, higher-tier pricing. 10\. API access, VPAT/ACR-supporting export.

(Saved audit history and dashboard/site-page views, phase-2 items in v1, are now part of the MVP itself per `architecture` — moved up accordingly.)

## 8\. Related docs

- `architecture` — system behavior, state machines, data model, new pages (Dashboard, User Audits, Site page).  
- `style-guide` — brand identity, UX design principles, and the explicit rule against lawsuit/legal-risk framing as an urgency mechanism.

