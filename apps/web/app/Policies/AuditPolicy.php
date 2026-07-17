<?php

namespace App\Policies;

use App\Models\Audit;
use App\Models\User;
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
     * Deliberately does NOT check the free-tier site cap or the 24h
     * re-scan-frequency rule — both need to surface a specific, helpful
     * message (an upgrade prompt / an "available at" timestamp) rather than a
     * bare yes/no gate, so they stay in CreateAudit::assertSiteCapAllowed()
     * and CreateAudit::assertRescanAllowed() instead, where they're caught in
     * StoreController and turned into redirect-back-with-errors.
     */
    public function create(User $user): bool
    {
        // No more than one queued/started audit in flight per account, both plans.
        return ! $user->audits()->whereIn('status', [Status::Queued, Status::Started])->exists();
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
