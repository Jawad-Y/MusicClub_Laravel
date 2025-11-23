<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\Instrument;

class InstrumentMaintenance extends Model
{
    protected $fillable = [
        'instrument_id', 
        'description', 
        'date', 
        'notes'
    ];
    public function instrument(): BelongsTo
    {
        return $this->belongsTo(Instrument::class, 'instrument_id');
    }
}