<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Step 5 — Franchisee Requirements
            $table->decimal('min_net_worth', 15, 2);
            $table->decimal('min_liquid_assets', 15, 2);
            $table->boolean('prior_experience')->default(false);
            $table->string('experience_type')->nullable();
            $table->text('other_qualifications')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_requirements');
    }
};
