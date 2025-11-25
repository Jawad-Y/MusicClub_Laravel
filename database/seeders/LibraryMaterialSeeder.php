<?php

namespace Database\Seeders;

use App\Models\LibraryMaterial;
use Illuminate\Database\Seeder;

class LibraryMaterialSeeder extends Seeder
{
    public function run(): void
    {
        $titles = [
            'Violin Fundamentals Guide',
            'Flute Technique Book',
            'Music Theory Workbook',
            'Rhythm and Meter Practice',
            'Ear Training Exercises',
            'Performance Guide',
            'Scale Studies Collection',
        ];

        for ($i = 1; $i <= 15; $i++) {
            LibraryMaterial::create([
                'title' => $titles[array_rand($titles)] . ' - Volume ' . $i,
                'description' => 'Educational material for music students',
                'file_url' => '/library/material_' . $i . '.pdf',
                'instrument_type_id' => rand(1, 17),
                'uploaded_by' => rand(2, 5),
                'uploaded_at' => now()->subDays(rand(1, 60)),
            ]);
        }
    }
}
