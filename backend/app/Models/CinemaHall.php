<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class CinemaHall extends Model
{
    protected $fillable = [
        'name',
        'rows', 
        'seats_per_row',
        'layout',
        'standard_price',
        'vip_price',
        'is_active'
    ];

    protected $casts = [
        'layout' => 'array',
        'is_active' => 'boolean',
        'standard_price' => 'integer',
        'vip_price' => 'integer'
    ];
}