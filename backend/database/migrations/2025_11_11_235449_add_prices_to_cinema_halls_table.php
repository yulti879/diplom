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
        Schema::table('cinema_halls', function (Blueprint $table) {
            $table->integer('standard_price')->default(500)->after('seats_per_row');
            $table->integer('vip_price')->default(800)->after('standard_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cinema_halls', function (Blueprint $table) {
            $table->dropColumn(['standard_price', 'vip_price']);
        });
    }
};