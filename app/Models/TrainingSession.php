<?php

namespace App\Models;

use App\Models\SessionAttendance;
use App\Models\User;
use App\Models\Clas;
use App\Models\PerformanceReview;
use App\Models\Homework;
use App\Models\SessionAttendance as ModelsSessionAttendance;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



class TrainingSession extends Model
{
    protected $fillable = [
        'class_id',
        'trainer_id',
        'subject',
        'date',
        'start_time',
        'end_time',
        'location',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i:s',
        'end_time' => 'datetime:H:i:s',
    ];

    
    public function class(): BelongsTo
    {
        return $this->belongsTo(Clas::class, 'class_id');
    }

    
    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    
    public function attendances(): HasMany
    {
        return $this->hasMany(ModelsSessionAttendance::class, 'session_id');
    }

    
    public function performanceReviews(): HasMany
    {
        return $this->hasMany(PerformanceReview::class, 'session_id');
    }

    
    public function homework(): HasMany
    {
        return $this->hasMany(Homework::class, 'session_id');
    }
}