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
        // Remove old columns
        $table->dropColumn(['annual_income', 'salary']);

        // Add new agreed fields
        $table->string('income_source')->nullable(); // Salary / Business Owner / Freelance
        $table->decimal('monthly_income', 15, 2)->nullable();
        $table->text('other_income')->nullable();
        $table->decimal('monthly_expenses', 15, 2)->nullable();
        $table->decimal('existing_loans', 15, 2)->nullable();
    });
}

public function down(): void
{
    Schema::table('financials', function (Blueprint $table) {
        // Rollback = remove new fields, add old ones back
        $table->dropColumn([
            'income_source',
            'monthly_income',
            'other_income',
            'monthly_expenses',
            'existing_loans',
        ]);

        $table->integer('annual_income');
        $table->integer('salary');
    });
}

};
