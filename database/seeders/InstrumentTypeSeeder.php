<?php

namespace Database\Seeders;

use App\Models\InstrumentType;
use Illuminate\Database\Seeder;

class InstrumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Violin',
            'Viola',
            'Cello',
            'Double Bass',
            'Flute',
            'Clarinet',
            'Oboe',
            'Saxophone',
            'French Horn',
            'Trumpet',
            'Trombone',
            'Tuba',
            'Percussion',
            'Drums',
            'Piano',
            'Guitar',
            'Ukulele',
        ];

        foreach ($types as $type) {
            InstrumentType::create(['name' => $type]);
        }
    }
}
