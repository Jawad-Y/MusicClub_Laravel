<?php

namespace Database\Seeders;

use App\Models\Instrument;
use Illuminate\Database\Seeder;

class InstrumentSeeder extends Seeder
{
    public function run(): void
    {
        $conditions = ['excellent', 'good', 'fair', 'needs_maintenance'];

        // Violins
        for ($i = 1; $i <= 5; $i++) {
            Instrument::create([
                'name' => "Violin #$i",
                'instrument_type_id' => 1,
                'unique_code' => 'VN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => $conditions[array_rand($conditions)],
            ]);
        }

        // Flutes
        for ($i = 1; $i <= 4; $i++) {
            Instrument::create([
                'name' => "Flute #$i",
                'instrument_type_id' => 5,
                'unique_code' => 'FL-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => $conditions[array_rand($conditions)],
            ]);
        }

        // Drums
        for ($i = 1; $i <= 3; $i++) {
            Instrument::create([
                'name' => "Drum Set #$i",
                'instrument_type_id' => 14,
                'unique_code' => 'DR-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => $conditions[array_rand($conditions)],
            ]);
        }

        // Guitars
        for ($i = 1; $i <= 5; $i++) {
            Instrument::create([
                'name' => "Guitar #$i",
                'instrument_type_id' => 16,
                'unique_code' => 'GT-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => $conditions[array_rand($conditions)],
            ]);
        }

        // Pianos
        for ($i = 1; $i <= 2; $i++) {
            Instrument::create([
                'name' => "Piano #$i",
                'instrument_type_id' => 15,
                'unique_code' => 'PN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'condition' => $conditions[array_rand($conditions)],
            ]);
        }
    }
}
