<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Screening;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with('screening.movie', 'screening.cinemaHall')->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'screening_id' => [
                'required',
                'exists:screenings,id'
            ],
            'seats' => [
                'required',
                'array',
                'min:1',
                'max:6' // Максимум 6 мест за раз
            ],
            'seats.*' => [
                'string',
                'regex:/^\d+-\d+$/' // Формат "ряд-место"
            ],
            'total_price' => [
                'required',
                'numeric',
                'min:0'
            ]
        ]);

        // Проверяем что места доступны
        $screening = Screening::find($validated['screening_id']);
        $existingBookings = Booking::where('screening_id', $validated['screening_id'])
            ->where('status', 'confirmed')
            ->get();

        $takenSeats = [];
        foreach ($existingBookings as $booking) {
            $takenSeats = array_merge($takenSeats, $booking->seats);
        }

        $conflictingSeats = array_intersect($validated['seats'], $takenSeats);
        if (!empty($conflictingSeats)) {
            return response()->json([
                'success' => false,
                'message' => 'Некоторые места уже заняты: ' . implode(', ', $conflictingSeats)
            ], 422);
        }

        $booking = Booking::create([
            'screening_id' => $validated['screening_id'],
            'booking_code' => Booking::generateBookingCode(),
            'seats' => $validated['seats'],
            'total_price' => $validated['total_price'],
            'status' => 'confirmed'
        ]);

        $booking->load('screening.movie', 'screening.cinemaHall');

        // Отладка
        logger('Booking created:', [
            'booking_code' => $booking->booking_code,
            'qr_code_url' => $booking->qr_code_url
        ]);

        $responseData = [
            'id' => $booking->id,
            'booking_code' => $booking->booking_code,
            'seats' => $booking->seats,
            'total_price' => $booking->total_price,
            'status' => $booking->status,
            'created_at' => $booking->created_at,
            'qr_code_url' => url("/api/qr-code/booking/{$booking->booking_code}/image"),
            'screening' => $booking->screening
        ];

        // Отладка
        logger('API response data:', $responseData);

        return response()->json([
            'success' => true,
            'data' => $responseData,
            'message' => 'Бронирование успешно создано'
        ], 201);
    }

    public function show($code)
    {
        $booking = Booking::with('screening.movie', 'screening.cinemaHall')
            ->where('booking_code', $code)
            ->first();

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Бронирование не найдено'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    public function destroy($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Бронирование не найдено'
            ], 404);
        }

        $booking->delete();

        return response()->json([
            'success' => true,
            'message' => 'Бронирование отменено'
        ]);
    }
}
