<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_backgrounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Step 4 — Business Background
            $table->string('industry_sector');
            $table->unsignedInteger('years_in_operation');
            $table->decimal('total_revenue', 15, 2)->nullable();
            $table->string('awards')->nullable();
            $table->text('company_history')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_backgrounds');
    }
};
