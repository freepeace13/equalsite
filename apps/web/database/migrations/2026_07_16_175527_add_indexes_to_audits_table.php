<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // AuditPolicy::create() (in-flight cap, site cap) and CreateAudit's
        // re-scan check all run on every POST /audit, always scoped by
        // user_id first — these composite indexes keep that scan-narrowed
        // rather than falling back to a per-user table scan as history grows
        // (unbounded for Pro accounts as of this feature).
        Schema::table('audits', function (Blueprint $table) {
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'domain', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audits', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status']);
            $table->dropIndex(['user_id', 'domain', 'created_at']);
        });
    }
};
