<?php

namespace App\Policies;

use App\Models\Audit;
use App\Models\User;
use App\Support\Plan\PlanLimits;
use App\Value\Status;

class AuditPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Audit $audit): bool
    {
        // user owned audits only
        return $audit->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     *
     * Deliberately does NOT check the 24h re-scan-frequency rule for an
     * existing site — producing a specific "available at" timestamp is
     * response shaping, not a yes/no gate, so that stays in
     * CreateAudit::assertRescanAllowed() instead. $domain is accepted here
     * only so the site-cap check below can tell "re-scanning a site you
     * already own" apart from "adding a new site" — do not extend this into
     * re-scan-frequency territory, or the two checks will drift.
     */
    public function create(User $user, ?string $domain = null): bool
    {
        // No more than one queued/started audit in flight per account, both plans.
        if ($user->audits()->whereIn('status', [Status::Queued, Status::Started])->exists()) {
            return false;
        }

        $limits = PlanLimits::for($user->plan);

        // Pro: no site cap, nothing further to check here.
        if ($limits->siteCap() === null) {
            return true;
        }

        $existingDomains = $user->audits()->distinct('domain')->pluck('domain');

        // Re-scanning an already-owned site never counts against the site cap.
        if ($domain !== null && $existingDomains->contains($domain)) {
            return true;
        }

        return $existingDomains->count() < $limits->siteCap();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Audit $audit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Audit $audit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Audit $audit): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Audit $audit): bool
    {
        return false;
    }
}
