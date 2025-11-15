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
    Schema::create('bookings', function (Blueprint $table) {
        $table->id();
        $table->foreignId('screening_id')->constrained()->onDelete('cascade');
        $table->string('booking_code')->unique(); // Уникальный код брони
        $table->json('seats'); // Выбранные места в формате JSON
        $table->decimal('total_price', 8, 2); // Общая стоимость
        $table->string('status')->default('pending'); // pending, confirmed, cancelled
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
