<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Every current authorization path (Sites\IndexController/ShowController,
        // AuditPolicy::view()) already scopes strictly by $request->user()->audits(),
        // so a user_id = NULL row is already unreachable by any user in the app
        // today — deleting it destroys nothing anyone can currently see. This is
        // dev/pre-launch data (confirmed 63 total / 56 orphaned rows), not a
        // "nuking a paying customer's history" situation. Explicitly deleting here
        // (rather than a manual tinker/seed step) keeps the cleanup auditable and
        // replayable in a fresh environment.
        DB::transaction(function (): void {
            $orphanIds = DB::table('audits')->whereNull('user_id')->pluck('id');

            if ($orphanIds->isNotEmpty()) {
                // audit_violations has no FK on audit_id (confirmed via schema
                // inspection), so nothing cascades — delete explicitly, and before
                // the audits themselves.
                DB::table('audit_violations')->whereIn('audit_id', $orphanIds)->delete();
                DB::table('audits')->whereIn('id', $orphanIds)->delete();
            }
        });

        // The existing FK is ON DELETE SET NULL — MySQL refuses to modify the
        // column to NOT NULL while that constraint still references it
        // ("Column 'user_id' cannot be NOT NULL: needed in a foreign key
        // constraint ... SET NULL"), so the old FK must be dropped first.
        Schema::table('audits', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
        });

        Schema::table('audits', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
        });

        // nullOnDelete() can't null a NOT NULL column — swap to cascadeOnDelete(),
        // since "delete the user's audits when the user is deleted" is the only
        // coherent behavior once ownership is mandatory.
        Schema::table('audits', function (Blueprint $table): void {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * Irreversible by design: deleted orphan rows cannot be restored. down()
     * only reverts the NOT NULL constraint and the FK delete behavior.
     */
    public function down(): void
    {
        Schema::table('audits', function (Blueprint $table): void {
            $table->dropForeign(['user_id']);
        });

        Schema::table('audits', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable()->change();
        });

        Schema::table('audits', function (Blueprint $table): void {
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }
};
