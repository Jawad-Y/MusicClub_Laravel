<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryMaterial extends Model
{
    protected $fillable = [
        'title', 
        'description', 
        'file_url', 
        'instrument_type_id', 
        'uploaded_by',
        'uploaded_at'
    ];

    public function instrumentType(): BelongsTo
    {
        return $this->belongsTo(InstrumentType::class, 'instrument_type_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}