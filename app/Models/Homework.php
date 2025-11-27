<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;


class Homework extends Model
{
    protected $fillable = [
        'assign_scope',
        'description',
        'due_date',
        'training_sessions_id',
    ];

    public function trainingSession(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class , 'training_sessions_id');
    }

    public function homeworkSubmissions(): HasMany
    {
        return $this->hasMany(HomeworkSubmission::class,);
    }

    /**
     * Scope homework accessible by the given user based on their role
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
            return $query->whereHas('trainingSession.class', function ($q) use ($departmentIds) {
                $q->whereIn('department_id', $departmentIds);
            });
        }

        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return $query->whereHas('trainingSession', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainer()) {
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereHas('trainingSession', function ($q) use ($user, $classIds) {
                $q->where('trainer_id', $user->id)
                  ->orWhereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainee()) {
            // Trainees can see homework for their enrolled classes
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereHas('trainingSession', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            });
        }

        return $query->whereRaw('1 = 0');
    }
}