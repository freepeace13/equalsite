<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('audit_id')->constrained()->cascadeOnDelete();
            $table->string('url');
            $table->string('status');

            $table->unsignedInteger('attempts_count')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('skipped_at')->nullable();
            $table->timestamp('last_activity_at');

            $table->unsignedInteger('violations_count')->nullable();
            $table->unsignedInteger('critical_count')->nullable();
            $table->unsignedInteger('serious_count')->nullable();
            $table->unsignedInteger('moderate_count')->nullable();
            $table->unsignedInteger('minor_count')->nullable();

            $table->string('error_code')->nullable();
            $table->text('error_message')->nullable();
            $table->text('skipping_reason')->nullable();

            $table->timestamps();

            $table->unique(['audit_id', 'url']);
            $table->index(['audit_id', 'status']);
            $table->index(['audit_id', 'last_activity_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_pages');
    }
};
