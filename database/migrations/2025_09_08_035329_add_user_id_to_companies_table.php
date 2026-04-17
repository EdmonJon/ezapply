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
    Schema::table('companies', function (Blueprint $table) {
        $table->foreignId('user_id')
              ->nullable() // allow null if some companies don’t have an owner yet
              ->constrained('users') // link to users table
              ->onDelete('cascade'); // delete company if user is deleted
    });
}

public function down(): void
{
    Schema::table('companies', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}

};
