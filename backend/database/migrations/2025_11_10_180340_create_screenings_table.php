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
        Schema::create('screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_id')->constrained()->onDelete('cascade');
            $table->foreignId('cinema_hall_id')->constrained()->onDelete('cascade');
            $table->date('date'); // Дата сеанса
            $table->time('start_time'); // Время начала
            $table->timestamps();

            // Уникальность: нельзя иметь два сеанса в одном зале в одно время
            $table->unique(['cinema_hall_id', 'date', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screenings');
    }
};
