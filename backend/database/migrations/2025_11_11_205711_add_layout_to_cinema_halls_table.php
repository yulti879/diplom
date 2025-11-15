<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('cinema_halls', function (Blueprint $table) {
            $table->json('layout')->nullable()->change(); // Делаем nullable и меняем тип если нужно
        });
    }

    public function down()
    {
        Schema::table('cinema_halls', function (Blueprint $table) {
            $table->json('layout')->nullable(false)->change();
        });
    }
};