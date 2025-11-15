<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Screening;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем существующие сеансы
        $screening1 = Screening::find(1); // Первый сеанс
        $screening2 = Screening::find(2); // Второй сеанс

        if (!$screening1 || !$screening2) {
            echo "No screenings found. Please run ScreeningSeeder first.\n";
            return;
        }

        // Создаем тестовые бронирования
        Booking::create([
            'screening_id' => $screening1->id,
            'booking_code' => Booking::generateBookingCode(),
            'seats' => ['1-3', '1-4'], // VIP места в первом ряду
            'total_price' => 1600, // 2 × 800
            'status' => 'confirmed'
        ]);

        Booking::create([
            'screening_id' => $screening1->id,
            'booking_code' => Booking::generateBookingCode(),
            'seats' => ['3-5', '3-6'], // Стандартные места в третьем ряду
            'total_price' => 1000, // 2 × 500
            'status' => 'confirmed'
        ]);

        Booking::create([
            'screening_id' => $screening2->id,
            'booking_code' => Booking::generateBookingCode(),
            'seats' => ['2-2', '2-3'], // VIP места во втором ряду
            'total_price' => 1600,
            'status' => 'confirmed'
        ]);

        echo "Test bookings created!\n";
        echo "Screening 1 booked seats: 1-3, 1-4, 3-5, 3-6\n";
        echo "Screening 2 booked seats: 2-2, 2-3\n";
    }
}