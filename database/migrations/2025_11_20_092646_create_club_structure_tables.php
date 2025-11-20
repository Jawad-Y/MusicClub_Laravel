<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->id(); // role_id
            $table->string('role_name', 50);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2) Users
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // user_id
            $table->string('full_name', 100);
            $table->string('email', 150)->unique();
            $table->string('phone', 30)->nullable();
            $table->foreignId('role_id')->constrained('roles');
            $table->string('status', 20)->default('active');
            $table->timestamps();
        });

        // 3) Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id(); // department_id
            $table->string('department_name', 100);
            $table->foreignId('leader_id')->nullable()->constrained('users'); // Department Leader
            $table->timestamps();
        });

        // 4) Classes
        Schema::create('classes', function (Blueprint $table) {
            $table->id(); // class_id
            $table->string('class_name', 100);
            $table->foreignId('department_id')->constrained('departments');
            $table->foreignId('class_leader_id')->nullable()->constrained('users');
            $table->timestamps();
        });

        // 5) Class members (Trainer / Trainee)
        Schema::create('class_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes');
            $table->foreignId('user_id')->constrained('users');
            $table->string('role', 20); // trainer / trainee
            $table->timestamps();
        });

        // 6) Instruments
        Schema::create('instruments', function (Blueprint $table) {
            $table->id(); // instrument_id
            $table->string('name', 100);
            $table->string('type', 100);
            $table->string('unique_code', 100)->unique();
            $table->string('condition', 50)->default('good'); // good / needs_repair / maintenance_required
            $table->timestamps();
        });

        // 7) User assignments (Department / Class / Instrument)
        Schema::create('user_assignments', function (Blueprint $table) {
            $table->id(); // assignment_id
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('class_id')->nullable()->constrained('classes');
            $table->foreignId('department_id')->nullable()->constrained('departments');
            $table->foreignId('instrument_id')->nullable()->constrained('instruments');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        // 8) Training sessions
        Schema::create('training_sessions', function (Blueprint $table) {
            $table->id(); // session_id
            $table->foreignId('class_id')->constrained('classes');
            $table->foreignId('trainer_id')->constrained('users');
            $table->string('subject', 200);
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location', 150)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 9) Session attendance
        Schema::create('session_attendance', function (Blueprint $table) {
            $table->id(); // attendance_id
            $table->foreignId('session_id')->constrained('training_sessions');
            $table->foreignId('trainee_id')->constrained('users');
            $table->string('status', 20); // present / absent / late
            $table->string('confirmation', 20)->default('pending'); // accepted / declined / pending
            $table->timestamps();
        });

        // 10) Homework
        Schema::create('homework', function (Blueprint $table) {
            $table->id(); // homework_id
            $table->foreignId('session_id')->constrained('training_sessions');
            $table->string('assign_scope', 20); // class / trainee
            $table->text('description');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        // 11) Homework submissions
        Schema::create('homework_submissions', function (Blueprint $table) {
            $table->id(); // submission_id
            $table->foreignId('homework_id')->constrained('homework');
            $table->foreignId('trainee_id')->constrained('users');
            $table->string('file_url', 255)->nullable();
            $table->text('notes')->nullable();
            $table->dateTime('submitted_at')->nullable();
            $table->timestamps();
        });

        // 12) Performance reviews
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id(); // review_id
            $table->foreignId('trainee_id')->constrained('users');
            $table->foreignId('trainer_id')->constrained('users');
            $table->foreignId('session_id')->nullable()->constrained('training_sessions');
            $table->integer('rating')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 13) Learning library materials
        Schema::create('library_materials', function (Blueprint $table) {
            $table->id(); // material_id
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('file_url', 255)->nullable();
            $table->foreignId('instrument_id')->nullable()->constrained('instruments');
            $table->foreignId('uploaded_by')->constrained('users'); // trainer
            $table->dateTime('uploaded_at')->nullable();
            $table->timestamps();
        });

        // 14) Events
        Schema::create('events', function (Blueprint $table) {
            $table->id(); // event_id
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->string('location', 150)->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        // 15) Event participants
        Schema::create('event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('user_id')->constrained('users');
            $table->string('role', 50)->nullable(); // performer / attendee / volunteer
            $table->timestamps();
        });

        // 16) Clothing items
        Schema::create('clothing_items', function (Blueprint $table) {
            $table->id(); // item_id
            $table->string('category', 100); // uniform / accessory ...
            $table->string('size', 20)->nullable();
            $table->integer('quantity')->default(0);
            $table->timestamps();
        });

        // 17) Clothing assignments
        Schema::create('clothing_assignments', function (Blueprint $table) {
            $table->id(); // assignment_id
            $table->foreignId('item_id')->constrained('clothing_items');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('assigned_at');
            $table->dateTime('returned_at')->nullable();
            $table->timestamps();
        });

        // 18) Instrument assignments
        Schema::create('instrument_assignments', function (Blueprint $table) {
            $table->id(); // assignment_id
            $table->foreignId('instrument_id')->constrained('instruments');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('assigned_at');
            $table->dateTime('returned_at')->nullable();
            $table->timestamps();
        });

        // 19) Instrument maintenance
        Schema::create('instrument_maintenance', function (Blueprint $table) {
            $table->id(); // maintenance_id
            $table->foreignId('instrument_id')->constrained('instruments');
            $table->text('description');
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 20) Memberships
        Schema::create('memberships', function (Blueprint $table) {
            $table->id(); // membership_id
            $table->foreignId('user_id')->constrained('users');
            $table->string('status', 20)->default('active'); // active / inactive / graduated
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        // 21) Reports log (optional)
        Schema::create('reports_log', function (Blueprint $table) {
            $table->id(); // report_id
            $table->foreignId('created_by')->constrained('users');
            $table->string('type', 100);
            $table->dateTime('created_at_report');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports_log');
        Schema::dropIfExists('memberships');
        Schema::dropIfExists('instrument_maintenance');
        Schema::dropIfExists('instrument_assignments');
        Schema::dropIfExists('clothing_assignments');
        Schema::dropIfExists('clothing_items');
        Schema::dropIfExists('event_participants');
        Schema::dropIfExists('events');
        Schema::dropIfExists('library_materials');
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('homework_submissions');
        Schema::dropIfExists('homework');
        Schema::dropIfExists('session_attendance');
        Schema::dropIfExists('training_sessions');
        Schema::dropIfExists('user_assignments');
        Schema::dropIfExists('instruments');
        Schema::dropIfExists('class_members');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
    }
};