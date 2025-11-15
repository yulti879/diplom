<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Movie;

class MovieSeeder extends Seeder
{
    public function run(): void
    {
        Movie::create([
            'title' => 'Первый фильм',
            'poster_url' => '/images/posters/poster1.jpg',
            'synopsis' => 'Захватывающее приключение в мире фантастики',
            'duration' => 130,
            'origin' => 'США'
        ]);

        Movie::create([
            'title' => 'Альфа',
            'poster_url' => '/images/posters/poster2.jpg', 
            'synopsis' => 'Эпическая драма о выживании и преодолении',
            'duration' => 96,
            'origin' => 'Франция'
        ]);

        Movie::create([
            'title' => 'Хищник',
            'poster_url' => '/images/posters/poster3.jpg',
            'synopsis' => 'Научно-фантастический боевик с элементами ужасов',
            'duration' => 101,
            'origin' => 'Канада, США'
        ]);

        echo "Test movies created!\n";
    }
}