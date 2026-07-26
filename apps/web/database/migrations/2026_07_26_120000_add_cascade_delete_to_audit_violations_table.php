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
        // audit_violations.audit_id has never had a FK constraint, so any
        // row whose audit was already deleted before this migration is
        // orphaned and would block adding the constraint below.
        DB::table('audit_violations')
            ->whereNotIn('audit_id', DB::table('audits')->select('id'))
            ->delete();

        Schema::table('audit_violations', function (Blueprint $table): void {
            $table->foreign('audit_id')->references('id')->on('audits')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_violations', function (Blueprint $table): void {
            $table->dropForeign(['audit_id']);
        });
    }
};
