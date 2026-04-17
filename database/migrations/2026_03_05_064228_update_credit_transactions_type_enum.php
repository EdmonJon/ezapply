<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    DB::statement("ALTER TABLE credit_transactions MODIFY COLUMN type ENUM('signup_bonus','top_up','purchase_info','refund','usage')");
}

public function down(): void
{
    DB::statement("ALTER TABLE credit_transactions MODIFY COLUMN type ENUM('signup_bonus','top_up','purchase_info','refund')");
}
};
