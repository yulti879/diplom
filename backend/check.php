<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ПРОВЕРКА БАЗЫ ДАННЫХ ===\n";

// Залы
$hallsCount = \App\Models\CinemaHall::count();
echo "Всего залов: $hallsCount\n";

if ($hallsCount > 0) {
    $halls = \App\Models\CinemaHall::all();
    foreach ($halls as $hall) {
        echo " - {$hall->name} (рядов: {$hall->rows}, мест: {$hall->seats_per_row})\n";
    }
}

// Фильмы
$moviesCount = \App\Models\Movie::count();
echo "\nВсего фильмов: $moviesCount\n";

if ($moviesCount > 0) {
    $movies = \App\Models\Movie::all();
    foreach ($movies as $movie) {
        echo " - {$movie->title} ({$movie->duration} мин, {$movie->origin})\n";
    }
}

echo "\n=== КОНЕЦ ПРОВЕРКИ ===\n";