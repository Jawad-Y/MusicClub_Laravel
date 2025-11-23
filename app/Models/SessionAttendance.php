<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\TrainingSession;
use App\Models\User;

class SessionAttendance extends Model
{
    protected $table = 'session_attendance';
    protected $fillable = [
        'session_id',
        'trainee_id', 
        'status', 
        'confirmation'
    ];

   
    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'session_id');
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }
}