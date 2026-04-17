<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add ezcoin_cost column to companies table
        Schema::table('companies', function (Blueprint $table) {
            $table->unsignedInteger('ezcoin_cost')->default(0)->after('status')
                ->comment('EZCoin cost auto-assigned based on franchise_fee tier');
        });

        // Create ezcoin load history table
        Schema::create('ezcoin_load_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('ezcoin_loaded');        // coins loaded in this batch
            $table->unsignedInteger('bonus_coins')->default(0); // +100 per row bonus
            $table->string('loaded_by')->nullable();         // admin name/email
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ezcoin_load_histories');

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('ezcoin_cost');
        });
    }
};
