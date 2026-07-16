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
        Schema::table('users', function (Blueprint $table) {
            // Plain string column (not a DB-level enum), matching how audits.status
            // is stored and cast to App\Value\Status. Default 'free' backfills every
            // existing row (including the 56 currently-orphaned audits' users) as
            // well as future signups, with no separate data migration needed.
            $table->string('plan')->default('free')->after('email_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('plan');
        });
    }
};
