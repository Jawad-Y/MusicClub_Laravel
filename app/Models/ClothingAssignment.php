<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClothingAssignment extends Model
{
    protected $fillable = [
        'item_id',
        'user_id',
        'assigned_at',
        'returned_at',
    ];

    public function item()
    {
        return $this->belongsTo(ClothingItem::class, 'item_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
