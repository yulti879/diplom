<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Screening;
use App\Models\Movie;
use App\Models\CinemaHall;

class AdditionalScreeningsSeeder extends Seeder
{
    public function run(): void
    {
        $tomorrow = now()->addDay()->format('Y-m-d');
        $dayAfterTomorrow = now()->addDays(2)->format('Y-m-d');

        $movie1 = Movie::first();
        $movie2 = Movie::skip(1)->first();
        $hall1 = CinemaHall::first();
        $hall2 = CinemaHall::skip(1)->first();

        Screening::create([
            'movie_id' => $movie1->id,
            'cinema_hall_id' => $hall1->id,
            'date' => $tomorrow,
            'start_time' => '15:00'
        ]);

        Screening::create([
            'movie_id' => $movie2->id,
            'cinema_hall_id' => $hall2->id,
            'date' => $tomorrow,
            'start_time' => '17:30'
        ]);

        Screening::create([
            'movie_id' => $movie1->id,
            'cinema_hall_id' => $hall1->id,
            'date' => $dayAfterTomorrow,
            'start_time' => '14:00'
        ]);

        echo "Additional screenings created!\n";
    }
}