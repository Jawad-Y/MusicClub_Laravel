<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clas extends Model
{
    protected $fillable = [
        'class_name',
        'department_id',
        'class_leader_id',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function classLeader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'class_leader_id'); 
    }
    public function members(): HasMany
    {
        return $this->hasMany(User::class, 'class_members');
    }
}