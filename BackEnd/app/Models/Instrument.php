<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instrument extends Model
{
    protected $fillable = [
        'name',
        'instrument_type_id',
        'unique_code', 
        'condition'
    ];

    public function type(): BelongsTo
    {
        return $this->belongsTo(InstrumentType::class, 'instrument_type_id');
    }

    public function instrument_type(): BelongsTo
    {
        return $this->belongsTo(InstrumentType::class, 'instrument_type_id');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(InstrumentAssignment::class, 'instrument_id');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(InstrumentMaintenance::class, 'instrument_id');
    }

    public function userAssignments(): HasMany
    {
        return $this->hasMany(UserAssignment::class, 'instrument_id');
    }

    public function libraryMaterials(): HasMany
    {
        return $this->hasMany(LibraryMaterial::class, 'instrument_id');
    }
}