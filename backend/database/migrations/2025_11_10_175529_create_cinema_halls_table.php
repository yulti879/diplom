<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('cinema_halls', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Зал 1", "VIP зал"
            $table->integer('rows'); // количество рядов
            $table->integer('seats_per_row'); // мест в ряду
            $table->json('layout')->nullable(); // схема мест (VIP/standard/disabled)
            $table->boolean('is_active')->default(true); // открыт/закрыт для продаж
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cinema_halls');
    }
};
