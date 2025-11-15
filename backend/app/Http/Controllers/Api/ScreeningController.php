<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Screening;
use App\Models\Movie;
use App\Models\CinemaHall;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ScreeningController extends Controller
{
    public function index()
    {
        $screenings = Screening::with(['movie', 'cinemaHall'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $screenings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => [
                'required',
                'exists:movies,id'
            ],
            'cinema_hall_id' => [
                'required', 
                'exists:cinema_halls,id'
            ],
            'date' => [
                'required',
                'date',
                'after_or_equal:today'
            ],
            'start_time' => [
                'required',
                'date_format:H:i'
            ]
        ]);

        // Проверяем что зал свободен в это время
        $existingScreening = Screening::where('cinema_hall_id', $validated['cinema_hall_id'])
            ->where('date', $validated['date'])
            ->where('start_time', $validated['start_time'])
            ->first();

        if ($existingScreening) {
            return response()->json([
                'success' => false,
                'message' => 'This hall is already booked for the selected time'
            ], 422);
        }

        $screening = Screening::create($validated);

        // Загружаем связанные данные для ответа
        $screening->load(['movie', 'cinemaHall']);

        return response()->json([
            'success' => true,
            'data' => $screening,
            'message' => 'Screening created successfully'
        ], 201);
    }

    public function show(string $id)
    {
        $screening = Screening::with(['movie', 'cinemaHall'])->find($id);
        
        if (!$screening) {
            return response()->json([
                'success' => false,
                'message' => 'Screening not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $screening
        ]);
    }

    public function update(Request $request, string $id)
    {
        $screening = Screening::find($id);
        
        if (!$screening) {
            return response()->json([
                'success' => false,
                'message' => 'Screening not found'
            ], 404);
        }

        $validated = $request->validate([
            'movie_id' => [
                'sometimes',
                'exists:movies,id'
            ],
            'cinema_hall_id' => [
                'sometimes',
                'exists:cinema_halls,id'  
            ],
            'date' => [
                'sometimes',
                'date',
                'after_or_equal:today'
            ],
            'start_time' => [
                'sometimes',
                'date_format:H:i'
            ]
        ]);

        // Если меняем время/зал - проверяем конфликты
        if (isset($validated['cinema_hall_id']) || isset($validated['date']) || isset($validated['start_time'])) {
            $hallId = $validated['cinema_hall_id'] ?? $screening->cinema_hall_id;
            $date = $validated['date'] ?? $screening->date;
            $startTime = $validated['start_time'] ?? $screening->start_time;

            $existingScreening = Screening::where('cinema_hall_id', $hallId)
                ->where('date', $date)
                ->where('start_time', $startTime)
                ->where('id', '!=', $id)
                ->first();

            if ($existingScreening) {
                return response()->json([
                    'success' => false,
                    'message' => 'This hall is already booked for the selected time'
                ], 422);
            }
        }

        $screening->update($validated);
        $screening->load(['movie', 'cinemaHall']);

        return response()->json([
            'success' => true,
            'data' => $screening,
            'message' => 'Screening updated successfully'
        ]);
    }

    public function destroy(string $id)
    {
        $screening = Screening::find($id);
        
        if (!$screening) {
            return response()->json([
                'success' => false,
                'message' => 'Screening not found'
            ], 404);
        }

        $screening->delete();

        return response()->json([
            'success' => true,
            'message' => 'Screening deleted successfully'
        ]);
    }

    public function getBookedSeats($screeningId)
{
    $screening = Screening::find($screeningId);
    
    if (!$screening) {
        return response()->json([
            'success' => false,
            'message' => 'Screening not found'
        ], 404);
    }

    // Получаем все подтвержденные бронирования для этого сеанса
    $bookings = Booking::where('screening_id', $screeningId)
        ->where('status', 'confirmed')
        ->get();

    // Собираем все занятые места
    $bookedSeats = [];
    foreach ($bookings as $booking) {
        $bookedSeats = array_merge($bookedSeats, $booking->seats);
    }

    return response()->json([
        'success' => true,
        'data' => $bookedSeats
    ]);
}
}