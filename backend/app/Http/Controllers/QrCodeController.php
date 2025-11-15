<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeController extends Controller
{
    public function generateBookingQr($bookingCode)
    {
        $bookingData = [
            'booking_code' => $bookingCode,
            'type' => 'cinema_booking',
            'timestamp' => now()->toISOString(),
            'cinema' => 'ИдёмВКино'
        ];

        $qrData = json_encode($bookingData);
        
        // Используем SVG вместо PNG (не требует imagick)
        $qrCode = QrCode::size(250)
            ->style('square')
            ->eye('square')
            ->color(0, 0, 0)
            ->backgroundColor(255, 255, 255)
            ->generate($qrData);
            
        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    public function getBookingQr($bookingCode)
    {
        return $this->generateBookingQr($bookingCode);
    }
}