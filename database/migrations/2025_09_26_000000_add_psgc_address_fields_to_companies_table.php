<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('region_code')->nullable()->after('country');
            $table->string('region_name')->nullable()->after('region_code');
            $table->string('province_code')->nullable()->after('region_name');
            $table->string('province_name')->nullable()->after('province_code');
            $table->string('citymun_code')->nullable()->after('province_name');
            $table->string('citymun_name')->nullable()->after('citymun_code');
            $table->string('barangay_code')->nullable()->after('citymun_name');
            $table->string('barangay_name')->nullable()->after('barangay_code');
            $table->string('postal_code')->nullable()->after('barangay_name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn([
                'region_code',
                'region_name',
                'province_code',
                'province_name',
                'citymun_code',
                'citymun_name',
                'barangay_code',
                'barangay_name',
                'postal_code',
            ]);
        });
    }
};