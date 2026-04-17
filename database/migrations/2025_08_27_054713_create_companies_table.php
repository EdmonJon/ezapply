<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();

            // Step 1 — Company Information
            $table->string('company_name');
            $table->string('brand_name')->nullable();
            $table->string('city');
            $table->string('state_province');
            $table->string('zip_code');
            $table->string('country');
            $table->string('company_website')->nullable();
            $table->text('description');
            $table->unsignedSmallInteger('year_founded');
            $table->unsignedInteger('num_franchise_locations')->nullable();

            $table->timestamps();

            // enforce InnoDB for foreign key support
            $table->engine = 'InnoDB';
        });
    }

    public function down(): void {
        Schema::dropIfExists('companies');
    }
};
