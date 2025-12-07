<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;


class HomeworkSubmission extends Model
{

    protected $fillable = [
        'notes',
        'submitted_at',
        'file_url',
        'trainee_id',
        'homework_id',
    ];

    public function homework(): BelongsTo
    {
        return $this->belongsTo(Homework::class );
    }

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainee_id');
    }

    /**
     * Scope homework submissions accessible by the given user based on their role
     */
    public function scopeAccessibleBy(Builder $query, $user): Builder
    {
        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        if ($user->isAdmin() || $user->isLeader()) {
            return $query; // Full access
        }

        if ($user->isDepartmentLeader()) {
            $departmentIds = $user->ledDepartments()->pluck('id')->toArray();
            return $query->whereHas('homework.trainingSession.class', function ($q) use ($departmentIds) {
                $q->whereIn('department_id', $departmentIds);
            });
        }

        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return $query->whereHas('homework.trainingSession', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainer()) {
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereHas('homework.trainingSession', function ($q) use ($user, $classIds) {
                $q->where('trainer_id', $user->id)
                  ->orWhereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainee() || $user->isMember()) {
            // Trainees and members can only see their own submissions
            return $query->where('trainee_id', $user->id);
        }

        return $query->whereRaw('1 = 0');
    }
}