<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'screening_id',
        'booking_code',
        'seats',
        'total_price',
        'status'
    ];

    protected $casts = [
        'seats' => 'array',
        'total_price' => 'decimal:2'
    ];

    public function screening()
    {
        return $this->belongsTo(Screening::class);
    }

    public static function generateBookingCode()
    {
        return 'BK' . strtoupper(uniqid());
    }

    public function getQrCodeUrlAttribute()
    {
        return url("/api/qr-code/booking/{$this->booking_code}");
    }
}
