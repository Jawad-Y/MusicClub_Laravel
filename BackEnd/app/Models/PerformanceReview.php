<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Models\TrainingSession;
use App\Models\User;

class PerformanceReview extends Model
{
    protected $table = 'performance_reviews';
    protected $fillable = [
        'trainee_id',
        'trainer_id',
        'session_id',
        'rating',
        'notes'
    ];

   
    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }


    public function session(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class, 'session_id');
    }
}