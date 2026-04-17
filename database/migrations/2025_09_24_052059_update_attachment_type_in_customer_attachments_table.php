<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the enum column
        DB::statement("ALTER TABLE customer_attachments MODIFY attachment_type ENUM(
            'Resume/CV', 
            'Valid ID', 
            'Proof of Income', 
            'Proof of Address', 
            'Business Documents', 
            'other'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback to old enum values
        DB::statement("ALTER TABLE customer_attachments MODIFY attachment_type ENUM(
            'resume', 
            'cover_letter', 
            'portfolio', 
            'CVs', 
            'other'
        ) NOT NULL");
    }
};
