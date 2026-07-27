# Spec: Terms of Service, Privacy Policy, Refund/Cancellation Policy

Implementation spec for the three legal pages required before Equalsite can accept real payments.
Covers routing, page structure, and a content outline for each doc — not the final publishable legal
text (that still needs a lawyer's pass before going live). Companion specs for FAQ, cookie consent,
and the other secondary items will follow separately.

## 1. Why these three, together

- **Terms of Service** governs the account relationship and references the other two.
- **Privacy Policy** is a legal requirement (GDPR/CCPA) the moment there's a signup form, not just a
  payment form — Equalsite already has one.
- **Refund/Cancellation Policy** is effectively required by **Paddle** — as Merchant of Record, Paddle
  expects sellers to publish refund terms consistent with what its checkout promises (see
  `docs/monetization.md` §4).

They're speced together because they cross-link (ToS §"Payments" points to the refund policy; ToS
§"Your Data" points to the privacy policy) and share the same rendering mechanism.

## 2. Where they live

### Routes (`routes/web.php`)

Add outside the `auth` middleware group — these must be readable by anonymous visitors (Paddle,
prospective customers, and regulators don't have accounts):

```php
Route::get('/terms', LegalController::class)->name('legal.terms')->defaults('slug', 'terms');
Route::get('/privacy', LegalController::class)->name('legal.privacy')->defaults('slug', 'privacy');
Route::get('/refund-policy', LegalController::class)->name('legal.refund')->defaults('slug', 'refund');
```

Or, simpler and closer to existing conventions (one controller per concern, matching
`App\Http\Controllers\Audit\*`): three thin single-action controllers,
`App\Http\Controllers\Legal\{TermsController,PrivacyController,RefundPolicyController}`, each
rendering its own Inertia page. Prefer this — it matches the existing single-action-controller
pattern in this codebase (`HomeController`, `DashboardController`) rather than introducing a
slug-dispatch controller as a new pattern for three pages.

### Controllers

```php
namespace App\Http\Controllers\Legal;

class TermsController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('legal/terms', [
            'lastUpdated' => '2026-07-26',
        ]);
    }
}
```

Same shape for `PrivacyController` and `RefundPolicyController`. No Actions-layer class needed here —
there's no orchestration logic, just static content, so a bare controller is the right altitude (the
`Actions/` pattern in this repo is reserved for actual business logic, e.g. `CreateAudit`).

### Pages (`resources/js/pages/legal/`)

```
resources/js/pages/legal/
  terms.tsx
  privacy.tsx
  refund-policy.tsx
```

Each is a plain React/Inertia page (not a `.md` file rendered through a markdown pipeline — there's no
markdown renderer in the frontend today, and introducing one for three static pages that change
maybe twice a year is more machinery than the content needs). Structure as JSX with semantic
`<section>`/`<h2>` blocks styled per `docs/style-guide.md`, similar in spirit to how `welcome.tsx` is
laid out — long-form prose content, not a form or interactive component.

A shared `legal-layout.tsx` wrapper (in `resources/js/layouts/`) is worth adding once there are three
of these: consistent header, "Last updated {date}" stamp, and a simple prose max-width container. Skip
per-page duplication of that shell.

### Navigation / linking

- **Footer**: `welcome.tsx`'s existing `<footer>` (line 199) gets three more links alongside the
  GitHub link: Terms, Privacy, Refund Policy.
- **Signup/registration form**: add a "By signing up you agree to the [Terms] and [Privacy Policy]"
  line — check `resources/js/pages/auth/register.tsx` (Fortify-scaffolded) for where this fits.
- **Billing/checkout flow**: the Paddle checkout overlay (`docs/architecture.md` §2.2) should link the
  refund policy near the "Subscribe" button, since that's the point of intent where it's legally and
  practically most relevant.
- **Settings → Billing page**: link refund policy here too, next to the cancel-subscription control.

## 3. Content outline

Not final text — structure to hand to whoever drafts/reviews the real copy (yourself, a lawyer, or an
AI drafting pass grounded in this outline).

### Terms of Service

1. Acceptance of terms
2. Description of service (accessibility auditing via automated crawl + axe-core scan)
3. Account registration & responsibilities
4. **Acceptable use — scanning authorization**: user must only submit URLs they own or are authorized
   to scan; Equalsite reserves the right to refuse/block scans of unauthorized or abusive targets. This
   is the one clause unique to a crawler product — don't let it get lost in boilerplate.
5. Plans, billing, and payment (references Refund Policy)
6. Free/Pro plan limits are subject to change (references `docs/monetization.md` plan limits, without
   quoting exact numbers that will drift)
7. Data ownership — user's scanned-site content and audit results belong to the user
8. Intellectual property (Equalsite's own IP)
9. Service availability / no uptime guarantee (informal SLA language — see §5 of the original opinion)
10. Limitation of liability
11. Termination (by user, by Equalsite for ToS violation)
12. Governing law / jurisdiction
13. Changes to terms
14. Contact

### Privacy Policy

1. What we collect:
   - Account data (name, email, password hash — via Fortify)
   - Payment data (handled by Paddle as Merchant of Record — Equalsite does not store card details)
   - Audited site content: crawled pages, DOM snapshots, axe-core violation data, screenshots if
     captured (`audit_violations`, Crawlee dataset artifacts — see `docs/architecture.md` data model)
   - Usage/analytics data, if any is added later
2. How we use it (service delivery, billing, support, not sold to third parties)
3. **Sub-processors**: Paddle (payments), hosting provider, any analytics vendor — list explicitly
4. Data retention:
   - Account data: until account deletion
   - Audit artifacts: reference the free-tier history retention limit from `docs/monetization.md`
     (last 5 audits) as the *display* retention, but state the *storage* retention separately if
     different — worth resolving with the team before publishing, since today old audits aren't
     deleted, just hidden past the retention window
5. User rights (access, export, deletion — GDPR/CCPA language)
6. **Third-party site content caveat**: audited pages may contain data about people other than the
   Equalsite user (e.g., a company's own customer data incidentally captured in a crawled page) — worth
   a plain-language note that Equalsite acts as a processor for that incidental content, not a
   controller
7. Cookies (cross-reference the separate cookie-consent spec once written)
8. Security measures (high-level, not implementation detail)
9. Children's privacy (standard boilerplate — service not directed at minors)
10. International data transfers, if hosting is outside the user's region
11. Changes to policy
12. Contact / how to exercise data rights

### Refund/Cancellation Policy

1. Subscription billing cycle (monthly, per `docs/monetization.md` §5 pricing)
2. Cancellation: how (link to Settings → Billing → cancel subscription — already unguarded even when
   `MONETIZATION_ENABLED=false`, per `docs/monetization.md` §3) and effect (access continues until
   period end, no partial-period refund by default — standard SaaS stance, confirm before publishing)
3. Refund eligibility window — needs to align with whatever Paddle's own buyer-facing refund window is
   (Paddle enforces this at checkout independent of what you publish; your policy shouldn't promise
   something more generous than support can honor, or something Paddle's own terms contradict)
4. Refund request process (contact channel, expected response time)
5. Exceptions (e.g., no refund for ToS violations resulting in termination)
6. Failed payment / dunning behavior (what happens to plan access if a renewal charge fails — check
   whether `Listeners\Billing\SyncUserPlanFromSubscription` already has a stance on this)

## 4. Open questions before writing final copy

- Confirm actual audit-artifact **storage** retention (not just display retention) with whoever owns
  the data-lifecycle decision — Privacy Policy §4 depends on this being a real, not aspirational,
  answer.
- Confirm Paddle's own refund window/policy text (Paddle dashboard → policies) so the Refund Policy
  doesn't contradict it.
- Decide on a real support contact (email/ticketing) before any of the three docs go live — all three
  reference one.
- Legal review of final text is out of scope for this spec and for Claude to draft with authority —
  treat any drafted copy as a starting point for actual legal review, not final language.

## 5. Suggested build order

1. `legal-layout.tsx` shared layout + three controllers/routes/pages with placeholder content.
2. Footer, signup form, and billing-page links.
3. Real copy pass (drafted against the outlines above, then reviewed).
4. Feature test per controller asserting the route renders (matches existing test conventions, e.g.
   `tests/Feature/Audit/ExportMarkdownControllerTest.php`).
