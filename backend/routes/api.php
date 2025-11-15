<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CinemaHallController;
use App\Http\Controllers\Api\MovieController;
use App\Http\Controllers\Api\ScreeningController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\QrCodeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
});
Route::get(
    '/screenings/{screening}/booked-seats',
    [ScreeningController::class, 'getBookedSeats']
);
Route::get('/qr-code/booking/{bookingCode}', [QrCodeController::class, 'generateBookingQr']);
Route::get('/qr-code/booking/{bookingCode}/image', [QrCodeController::class, 'getBookingQr']);
Route::post('/upload-poster', [MovieController::class, 'uploadPoster']);

Route::apiResource('cinema-halls', CinemaHallController::class);
Route::apiResource('movies', MovieController::class);
Route::apiResource('screenings', ScreeningController::class);
Route::apiResource('bookings', BookingController::class);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});