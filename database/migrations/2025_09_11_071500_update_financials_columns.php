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
        Schema::table('financials', function (Blueprint $table) {
            $table->decimal('annual_income', 20, 2)->unsigned()->change();
            $table->decimal('salary', 20, 2)->unsigned()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financials', function (Blueprint $table) {
            $table->integer('annual_income')->change();
            $table->integer('salary')->change();
        });
    }
};


