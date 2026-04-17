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
        Schema::create('basicinfo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->foreignId('address_id')->constrained('users_address')->cascadeOnDelete();
            $table->date('birth_date');
            $table->string('phone', 20);
            $table->string('Facebook')->nullable();
            $table->string('LinkedIn')->nullable();
            $table->string('Viber')->nullable(); 
            
            $table->timestamps();


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('basicinfo');
    }
};
