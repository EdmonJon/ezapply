<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Handle duplicates by keeping the record with the highest id
        DB::statement('DELETE t1 FROM company_opportunities t1 INNER JOIN company_opportunities t2 WHERE t1.company_id = t2.company_id AND t1.id < t2.id');
        Schema::table('company_opportunities', function (Blueprint $table) {
            $table->unique('company_id');
        });

        DB::statement('DELETE t1 FROM company_backgrounds t1 INNER JOIN company_backgrounds t2 WHERE t1.company_id = t2.company_id AND t1.id < t2.id');
        Schema::table('company_backgrounds', function (Blueprint $table) {
            $table->unique('company_id');
        });

        DB::statement('DELETE t1 FROM company_requirements t1 INNER JOIN company_requirements t2 WHERE t1.company_id = t2.company_id AND t1.id < t2.id');
        Schema::table('company_requirements', function (Blueprint $table) {
            $table->unique('company_id');
        });

        DB::statement('DELETE t1 FROM company_marketings t1 INNER JOIN company_marketings t2 WHERE t1.company_id = t2.company_id AND t1.id < t2.id');
        Schema::table('company_marketings', function (Blueprint $table) {
            $table->unique('company_id');
        });

        DB::statement('DELETE t1 FROM company_documents t1 INNER JOIN company_documents t2 WHERE t1.company_id = t2.company_id AND t1.id < t2.id');
        Schema::table('company_documents', function (Blueprint $table) {
            $table->unique('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_opportunities', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
        });

        Schema::table('company_backgrounds', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
        });

        Schema::table('company_requirements', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
        });

        Schema::table('company_marketings', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
        });

        Schema::table('company_documents', function (Blueprint $table) {
            $table->dropUnique(['company_id']);
        });
    }
};
