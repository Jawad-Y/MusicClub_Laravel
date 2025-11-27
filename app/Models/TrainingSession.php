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
use Illuminate\Database\Eloquent\Builder;



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

    
    public function homeworks(): HasMany
    {
        return $this->hasMany(Homework::class, 'training_sessions_id');
    }

    /**
     * Scope training sessions accessible by the given user based on their role
     */
    public function scopeAccessibleBy(Builder $query, $user): Builder
    {
        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->isLeader()) {
            return $query; // Full access
        }

        if ($user->isDepartmentLeader()) {
            $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
            return $query->whereHas('class', function ($q) use ($departmentIds) {
                $q->whereIn('department_id', $departmentIds);
            });
        }

        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return $query->whereIn('class_id', $classIds);
        }

        if ($user->isTrainer()) {
            // Trainers can see sessions they teach or classes they're in
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->where(function ($q) use ($user, $classIds) {
                $q->where('trainer_id', $user->id)
                  ->orWhereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainee()) {
            // Trainees can only see sessions for their enrolled classes
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereIn('class_id', $classIds);
        }

        return $query->whereRaw('1 = 0');
    }
}