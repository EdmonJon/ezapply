<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applicant_views', function (Blueprint $table) {
            // Add field_key for per-field payment tracking
            $table->string('field_key')->nullable(false);

            // Prevent duplicate entries (user + application + field)
            $table->unique(['user_id', 'application_id', 'field_key'], 'unique_user_app_field');
        });
    }

    public function down(): void
    {
        Schema::table('applicant_views', function (Blueprint $table) {
            // Drop unique constraint first, then the column
            $table->dropUnique('unique_user_app_field');
            $table->dropColumn('field_key');
        });
    }
};
