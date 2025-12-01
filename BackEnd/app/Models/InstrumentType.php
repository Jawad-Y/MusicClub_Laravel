<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\Instrument;

class InstrumentType extends Model
{
    protected $fillable = ['name'];

    public function instruments(): HasMany
    {
        return $this->hasMany(Instrument::class, 'instrument_type_id');
    }
}