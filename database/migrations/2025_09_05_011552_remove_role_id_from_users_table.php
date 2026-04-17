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
            // Guard: only drop if column exists
            if (Schema::hasColumn('users', 'role_id')) {
                try {
                    $table->dropForeign(['role_id']);
                } catch (\Throwable $e) {
                    // ignore if FK not present
                }
                $table->dropColumn('role_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable();
                try {
                    $table->foreign('role_id')
                          ->references('id')
                          ->on('roles')
                          ->onDelete('set null');
                } catch (\Throwable $e) {
                    // ignore if roles table not present in down migration order
                }
            }
        });
    }
};
