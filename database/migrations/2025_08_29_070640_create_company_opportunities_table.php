<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Step 3 — Franchise Opportunity Details
            $table->string('franchise_type');
            $table->decimal('min_investment', 15, 2);
            $table->decimal('franchise_fee', 15, 2);
            $table->string('royalty_fee_structure');
            $table->decimal('avg_annual_revenue', 15, 2)->nullable();
            $table->string('target_markets');
            $table->text('training_support')->nullable();
            $table->string('franchise_term');
            $table->text('unique_selling_points')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_opportunities');
    }
};
