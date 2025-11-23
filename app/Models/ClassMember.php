<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassMember extends Model
{
        protected $fillable = [
        'role',
        'class_id',
        'user_id',
    ];

    public function class(): BelongsTo
    {
        return $this->belongsTo(Clas::class, 'class_id');
    }

    public function User(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}