# Trainee Permissions - Implementation Summary

## Overview
Trainees now have **read-only access** to most resources, with the ability to **create, view, update, and delete their own homework submissions**.

## Trainee Access Rules

### ✅ What Trainees CAN Do

1. **View Class Members** (Read-Only)
   - Can see members only from classes they are enrolled in
   - Cannot add, update, or remove class members
   - Endpoint: `GET /api/classmembers`

2. **View Training Sessions** (Read-Only)
   - Can see training sessions only for their enrolled classes
   - Cannot create, update, or delete sessions
   - Endpoints:
     - `GET /api/training-sessions` - List all accessible sessions
     - `GET /api/training-sessions/{id}` - View specific session

3. **View Homework** (Read-Only)
   - Can see homework assigned to their classes
   - Cannot create, update, or delete homework assignments
   - Endpoints:
     - `GET /api/homeworks` - List all accessible homework
     - `GET /api/homeworks/{id}` - View specific homework

4. **Manage Their Own Homework Submissions** (Full CRUD)
   - Can create new submissions
   - Can view their own submissions
   - Can update their own submissions
   - Can delete their own submissions
   - **Cannot** view, update, or delete other trainees' submissions
   - Endpoints:
     - `GET /api/homework-submissions` - List their submissions only
     - `GET /api/homework-submissions/{id}` - View their submission
     - `POST /api/homework-submissions` - Upload new submission
     - `PUT/PATCH /api/homework-submissions/{id}` - Update their submission
     - `DELETE /api/homework-submissions/{id}` - Delete their submission

### ❌ What Trainees CANNOT Do

- Create, update, or delete training sessions
- Create, update, or delete homework assignments
- Add or remove class members
- View or modify submissions from other trainees
- Access classes they are not enrolled in
- View users outside their enrolled classes
- Access departments or other administrative data

## Implementation Details

### Models Updated

1. **User Model** (`app/Models/User.php`)
   - Added `ledClasses()` relationship
   - Added `classMembers()` relationship
   - Integrated `HasRoleScopes` trait

2. **Clas Model** (`app/Models/Clas.php`)
   - Added `scopeAccessibleBy()` for filtering classes by user role

3. **Department Model** (`app/Models/Department.php`)
   - Added `scopeAccessibleBy()` for filtering departments by user role

4. **TrainingSession Model** (`app/Models/TrainingSession.php`)
   - Added `scopeAccessibleBy()` - trainees see sessions for enrolled classes

5. **Homework Model** (`app/Models/Homework.php`)
   - Added `scopeAccessibleBy()` - trainees see homework for enrolled classes

6. **HomeworkSubmission Model** (`app/Models/HomeworkSubmission.php`)
   - Added `scopeAccessibleBy()` - trainees see only their own submissions

### New Files Created

1. **HasRoleScopes Trait** (`app/Models/Traits/HasRoleScopes.php`)
   - `isLeader()` - Check if user is a Leader
   - `isDepartmentLeader()` - Check if user is a Department Leader
   - `isClassLeader()` - Check if user is a Class Leader
   - `isTrainer()` - Check if user is a Trainer
   - `isTrainee()` - Check if user is a Trainee
   - `getAccessibleDepartmentIds()` - Get accessible department IDs
   - `getAccessibleClassIds()` - Get accessible class IDs
   - `getAccessibleUserIds()` - Get accessible user IDs
   - `scopeAccessibleBy()` - Query scope for filtering users

2. **IsTraineeOwner Middleware** (`app/Http/Middleware/IsTraineeOwner.php`)
   - Ensures trainees can only create/update/delete their own homework submissions
   - Automatically sets `trainee_id` to authenticated user for trainees
   - Blocks trainees from modifying other trainees' submissions

3. **ApplyRoleScope Middleware** (`app/Http/Middleware/ApplyRoleScope.php`)
   - Stores authenticated user in app container for global access

4. **Example Controller** (`app/Http/Controllers/Examples/RoleScopedController.php`)
   - Demonstrates how to use the scopes in controllers

### Controllers Updated

1. **TrainingSessionController** (`app/Http/Controllers/Api/TrainingSessionController.php`)
   - `index()` - Filters sessions by `accessibleBy($user)`
   - `show()` - Ensures user can only view accessible sessions

2. **HomeworkController** (`app/Http/Controllers/Api/HomeworkController.php`)
   - `index()` - Filters homework by `accessibleBy($user)`
   - `show()` - Ensures user can only view accessible homework

3. **HomeworkSubmissionController** (`app/Http/Controllers/Api/HomeworkSubmissionController.php`)
   - `index()` - Trainees see only their submissions
   - `show()` - Trainees can only view their submissions
   - `store()` - Validates homework access before creating submission

4. **ClassMemberController** (`app/Http/Controllers/Api/ClassMemberController.php`)
   - `index()` - Filters members by accessible classes
   - `show()` - Ensures user can only view members from accessible classes

### Routes Updated (`routes/api.php`)

```php
// Class members - Trainees can view only
Route::apiResource('classmembers', ClassMemberController::class)
    ->only(['index', 'show'])
    ->middleware('class.access');

// Training sessions - Trainees can view only
Route::apiResource('training-sessions', TrainingSessionController::class)
    ->only(['index', 'show']);

// Homework - Trainees can view only
Route::apiResource('homeworks', HomeworkController::class)
    ->only(['index', 'show']);

// Homework submissions - Trainees can manage their own
Route::apiResource('homework-submissions', HomeworkSubmissionController::class)
    ->except(['index', 'show'])
    ->middleware('trainee.owner')
    ->middlewareFor(['store', 'update', 'destroy'], 'role:...,trainee');
```

### Middleware Registered (`bootstrap/app.php`)

```php
'trainee.owner' => \App\Http\Middleware\IsTraineeOwner::class,
```

## Testing Guide

### Test as Trainee

1. **Login as trainee**
   ```
   POST /api/login
   {
     "email": "trainee@example.com",
     "password": "password"
   }
   ```

2. **View class members (should see only classmates)**
   ```
   GET /api/classmembers
   ```

3. **View training sessions (should see only sessions for enrolled classes)**
   ```
   GET /api/training-sessions
   ```

4. **View homework (should see only homework for enrolled classes)**
   ```
   GET /api/homeworks
   ```

5. **Submit homework**
   ```
   POST /api/homework-submissions
   {
     "homework_id": 1,
     "trainee_id": 5,  // Auto-set by middleware
     "file_url": "https://example.com/submission.pdf",
     "notes": "My homework submission"
   }
   ```

6. **View own submissions**
   ```
   GET /api/homework-submissions
   ```

7. **Update own submission**
   ```
   PUT /api/homework-submissions/1
   {
     "notes": "Updated notes"
   }
   ```

8. **Try to update another trainee's submission (should fail with 403)**
   ```
   PUT /api/homework-submissions/999
   {
     "notes": "Trying to hack"
   }
   → Response: 403 Forbidden
   ```

9. **Try to create a training session (should fail with 403)**
   ```
   POST /api/training-sessions
   → Response: 403 Forbidden - role not allowed
   ```

## Security Features

1. **Automatic Scope Filtering**
   - All queries automatically filtered by user's role and access
   - Trainees cannot access data outside their enrolled classes

2. **Ownership Enforcement**
   - `IsTraineeOwner` middleware ensures trainees only modify their own submissions
   - `trainee_id` automatically set to prevent impersonation

3. **Route Protection**
   - Read-only routes separated from write routes
   - Write operations blocked by role middleware

4. **Database-Level Filtering**
   - Scopes applied at query level, not just authorization layer
   - Prevents accidental data leaks

## Quick Reference

### Trainee Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/classmembers` | GET | Read-Only | View classmates |
| `/api/classmembers/{id}` | GET | Read-Only | View specific classmate |
| `/api/training-sessions` | GET | Read-Only | List sessions for enrolled classes |
| `/api/training-sessions/{id}` | GET | Read-Only | View specific session |
| `/api/homeworks` | GET | Read-Only | List homework for enrolled classes |
| `/api/homeworks/{id}` | GET | Read-Only | View specific homework |
| `/api/homework-submissions` | GET | Own Only | List own submissions |
| `/api/homework-submissions` | POST | Create | Upload homework |
| `/api/homework-submissions/{id}` | GET | Own Only | View own submission |
| `/api/homework-submissions/{id}` | PUT/PATCH | Own Only | Update own submission |
| `/api/homework-submissions/{id}` | DELETE | Own Only | Delete own submission |

## Documentation Files

- **ROLE_SCOPES_GUIDE.md** - Comprehensive guide to the role-based scopes system
- **routes/scope-test-routes.php** - Example test routes for all roles
