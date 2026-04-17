<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('rating'); // 1–5
            $table->timestamps();
            $table->unique(['user_id', 'company_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_ratings');
    }
};