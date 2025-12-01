<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\User;

class ReportsLog extends Model
{
    protected $table = 'reports_log';
    protected $fillable = [
        'created_by', 
        'type', 
        'created_at_report'
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}