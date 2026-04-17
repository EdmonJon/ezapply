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
        Schema::create('franchise_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Financial info
            $table->decimal('net_worth', 20, 2)->nullable();
            $table->bigInteger('liquid_assets')->nullable();
            $table->bigInteger('annual_income')->nullable();
            $table->decimal('investment_budget', 20, 2)->nullable();
            $table->string('source_of_funds')->nullable();
            // Interest info
            $table->string('location')->nullable();  // preferred location
            $table->string('franchise_type')->nullable();
            $table->date('timeline')->nullable();
            $table->json('interested_companies')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('franchise_information');
    }
};
