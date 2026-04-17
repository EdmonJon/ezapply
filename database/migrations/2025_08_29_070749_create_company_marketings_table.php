<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_marketings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();

            // Step 6 — Marketing & Listing
            $table->string('listing_title')->nullable();
            $table->text('listing_description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('target_profile')->nullable();
            $table->string('preferred_contact_method')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_marketings');
    }
};
