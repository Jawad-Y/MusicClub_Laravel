<?php

namespace Database\Seeders;

use App\Models\ClothingItem;
use Illuminate\Database\Seeder;

class ClothingItemSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Shirt', 'Pants', 'Jacket', 'Hat', 'Tie', 'Shoes'];
        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        foreach ($categories as $category) {
            foreach ($sizes as $size) {
                ClothingItem::create([
                    'category' => $category,
                    'size' => $size,
                    'quantity' => rand(5, 20),
                ]);
            }
        }
    }
}
