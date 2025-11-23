<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClothingItem extends Model
{
    protected $fillable = [
        'category',
        'size',
        'quantity',
    ];

    public function assignments()
    {
        return $this->hasMany(ClothingAssignment::class, 'item_id');
    }
}