<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class UserAssignment extends Model
{
    protected $fillable = [
        'start_date',
        'end_date',
        'user_id',
        'class_id',
        'department_id',
        'instrument_id' ,


    ];
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function clas(): BelongsTo
    {
        return $this->belongsTo(Clas::class, 'class_id');
    }
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
    public function instruments(): BelongsTo
    {
        return $this->belongsTo(Instrument::class, 'instrument_id');
    }
}