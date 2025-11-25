<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Clas extends Model
{
    protected $table = 'classes';
    
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
    
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'class_members', 'class_id', 'user_id')
            ->withPivot('role')
            ->withTimestamps();
    }
}