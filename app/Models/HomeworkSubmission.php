<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


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
}