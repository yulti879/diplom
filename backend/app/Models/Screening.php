<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Screening extends Model
{
    protected $fillable = [
        'movie_id',
        'cinema_hall_id', 
        'date',
        'start_time'
    ];
    
    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
    
    public function cinemaHall()
    {
        return $this->belongsTo(CinemaHall::class);
    }
}