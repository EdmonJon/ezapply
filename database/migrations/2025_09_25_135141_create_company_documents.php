<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('company_documents', function (Blueprint $table) {
            $table->id();

            // Foreign key to companies.id
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            $table->string('dti_sbc_path')->nullable();
            $table->string('bir_2303_path')->nullable();
            $table->string('ipo_registration_path')->nullable();

            $table->timestamps();

            // enforce InnoDB for foreign key support
            $table->engine = 'InnoDB';
        });
    }

    public function down(): void {
        Schema::dropIfExists('company_documents');
    }
};
