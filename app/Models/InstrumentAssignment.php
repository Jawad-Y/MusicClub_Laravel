<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\User;
use App\Models\Instrument;
class InstrumentAssignment extends Model
{
    protected $fillable = [
        'instrument_id', 
        'user_id', 
        'assigned_at', 
        'returned_at'
    ];
    public function instrument(): BelongsTo
    {
        return $this->belongsTo(Instrument::class, 'instrument_id');
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}