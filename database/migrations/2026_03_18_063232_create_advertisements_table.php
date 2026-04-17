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
    Schema::create('advertisements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->foreignId('company_id')->constrained()->onDelete('cascade');
        $table->string('title');
        $table->text('description')->nullable();
        $table->string('file_path');
        $table->string('file_type'); // image, video, pdf
        $table->string('placement'); // homepage, sidebar, search, etc.
        $table->date('start_date');
        $table->date('end_date');
        $table->integer('daily_cost'); // 200 or 300
        $table->integer('estimated_total_cost');
        $table->enum('status', [
            'pending',
            'active',
            'rejected',
            'expired',
            'stopped'
        ])->default('pending');
        $table->timestamp('last_deducted_at')->nullable();
        $table->timestamps();
    });
}
 
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
 
 