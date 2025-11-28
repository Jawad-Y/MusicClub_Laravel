<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

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

    /**
     * Scope session attendance accessible by the given user based on their role
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
            return $query->whereHas('session.class', function ($q) use ($departmentIds) {
                $q->whereIn('department_id', $departmentIds);
            });
        }

        if ($user->isClassLeader()) {
            $classIds = $user->ledClasses()->pluck('id')->toArray();
            return $query->whereHas('session', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainer()) {
            $classIds = $user->classMembers()->pluck('classes.id')->toArray();
            return $query->whereHas('session', function ($q) use ($user, $classIds) {
                $q->where('trainer_id', $user->id)
                  ->orWhereIn('class_id', $classIds);
            });
        }

        if ($user->isTrainee() || $user->isMember()) {
            // Trainees and members can only see attendance for sessions in their enrolled classes
            return $query->where('trainee_id', $user->id);
        }

        return $query->whereRaw('1 = 0');
    }
}