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
        Schema::create('users_address', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->string('region_code')->nullable();
            $table->string('region_name')->nullable();
            $table->string('province_code')->nullable();
            $table->string('province_name')->nullable();
            $table->string('citymun_code')->nullable();
            $table->string('citymun_name')->nullable();
            $table->string('barangay_code')->nullable();
            $table->string('barangay_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users_address');
    }
};
