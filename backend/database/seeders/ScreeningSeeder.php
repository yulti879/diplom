<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Screening;
use App\Models\Movie;
use App\Models\CinemaHall;

class ScreeningSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем первые фильмы и залы
        $movie1 = Movie::first();
        $movie2 = Movie::skip(1)->first();
        $movie3 = Movie::skip(2)->first();
        
        $hall1 = CinemaHall::first();
        $hall2 = CinemaHall::skip(1)->first();

        // Сеансы на сегодня
        $today = now()->format('Y-m-d');

        Screening::create([
            'movie_id' => $movie1->id,
            'cinema_hall_id' => $hall1->id,
            'date' => $today,
            'start_time' => '10:20'
        ]);

        Screening::create([
            'movie_id' => $movie1->id,
            'cinema_hall_id' => $hall1->id,
            'date' => $today,
            'start_time' => '14:10'
        ]);

        Screening::create([
            'movie_id' => $movie2->id,
            'cinema_hall_id' => $hall2->id,
            'date' => $today,
            'start_time' => '11:15'
        ]);

        Screening::create([
            'movie_id' => $movie2->id,
            'cinema_hall_id' => $hall2->id,
            'date' => $today,
            'start_time' => '14:40'
        ]);

        Screening::create([
            'movie_id' => $movie3->id,
            'cinema_hall_id' => $hall1->id,
            'date' => $today,
            'start_time' => '18:00'
        ]);

        echo "Test screenings created!\n";
    }
}