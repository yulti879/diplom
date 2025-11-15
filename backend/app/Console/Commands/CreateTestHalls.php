<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CinemaHall;

class CreateTestHalls extends Command
{
    protected $signature = 'app:create-test-halls';
    protected $description = 'Create test cinema halls';

    public function handle()
    {
        CinemaHall::create([
            'name' => 'Зал 1',
            'rows' => 10,
            'seats_per_row' => 8,
            'is_active' => true
        ]);

        CinemaHall::create([
            'name' => 'VIP Зал',
            'rows' => 6,
            'seats_per_row' => 6,
            'is_active' => true
        ]);

        $this->info('Test cinema halls created successfully!');
        
        return Command::SUCCESS;
    }
}