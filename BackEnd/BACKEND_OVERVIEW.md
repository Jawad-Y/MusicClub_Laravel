# Music Club Management System - Backend Overview

## Table of Contents
1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Architecture](#api-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Roles & Permissions](#roles--permissions)
7. [Middleware System](#middleware-system)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Request/Response Patterns](#requestresponse-patterns)
10. [Data Models & Relationships](#data-models--relationships)

---

## Introduction

The Music Club Management System backend is a comprehensive Laravel 12 REST API designed to manage all aspects of a music club organization. It provides a complete solution for organizational hierarchy (departments, classes, roles), training management (sessions, attendance, homework), inventory control (instruments, clothing), performance tracking, events, and reporting.

The system implements sophisticated role-based access control with eight distinct user roles, each with carefully scoped permissions. All data access is filtered through model scopes and middleware to ensure users only see and manipulate data within their authorized scope.

---

## Technology Stack

- **Framework:** Laravel 12.39.0
- **PHP Version:** 8.2.26
- **Authentication:** Laravel Sanctum (token-based API authentication)
- **Database:** MySQL (configurable for SQLite)
- **Features:**
  - RESTful API design
  - Soft deletes on critical entities
  - Excel/CSV export capabilities (via Maatwebsite/Excel)
  - Comprehensive validation
  - Standardized JSON responses
  - Query scoping for multi-tenancy-like access control

---

## Database Schema

The database consists of 21 primary tables plus technical infrastructure tables. All tables use auto-incrementing integer primary keys and include Laravel timestamps (`created_at`, `updated_at`).

### Core Organization Tables

#### 1. `roles`
Defines system-wide roles for authorization.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Role identifier |
| `role_name` | varchar(50) | | Role name (e.g., "Admin", "leader", "trainee") |
| `description` | text | nullable | Human-readable description |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Purpose:** Central role definition used by all authorization middleware and scopes.

#### 2. `users`
Central user table for all system members.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | User identifier |
| `full_name` | varchar(100) | | Full name of the user |
| `email` | varchar(150) | unique | Email address (used for login) |
| `phone` | varchar(30) | nullable | Contact phone number |
| `role_id` | bigint | FK→roles.id | Assigned role |
| `status` | varchar(20) | indexed, default: 'active' | User status (active/inactive) |
| `password` | varchar(255) | | Bcrypt hashed password |
| `remember_token` | varchar(100) | nullable | Laravel "remember me" token |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |
| `deleted_at` | timestamp | nullable | Soft delete timestamp |

**Relationships:**
- Belongs to one `Role`
- Has many `ClassMember` (through class_members)
- Has many `TrainingSession` (as trainer)
- Has many `Membership`
- Leads `Department` and `Class` (as leader)

**Validation Rules:**
- `full_name`: required, max 100 chars
- `email`: required, email format, unique
- `phone`: optional, max 30 chars
- `role_id`: required, exists in roles table
- `status`: optional, max 20 chars
- `password`: required on create, min 8 chars (hashed)

#### 3. `departments`
Top-level organizational units.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Department identifier |
| `department_name` | varchar(100) | | Department name |
| `leader_id` | bigint | FK→users.id, nullable | Department Leader user |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Relationships:**
- Has many `Class`
- Belongs to one `User` (leader)

**Validation:**
- `department_name`: required, max 100 chars
- `leader_id`: optional, must exist in users

#### 4. `classes`
Teaching/rehearsal groups under departments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Class identifier |
| `class_name` | varchar(100) | | Class name |
| `department_id` | bigint | FK→departments.id | Parent department |
| `class_leader_id` | bigint | FK→users.id, nullable | Class Leader user |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Relationships:**
- Belongs to one `Department`
- Has many `ClassMember`
- Has many `TrainingSession`
- Belongs to one `User` (class_leader)

**Validation:**
- `class_name`: required, max 100 chars
- `department_id`: required, exists in departments
- `class_leader_id`: optional, exists in users

#### 5. `class_members`
Many-to-many relationship between users and classes with roles.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Member record identifier |
| `class_id` | bigint | FK→classes.id | Associated class |
| `user_id` | bigint | FK→users.id | Associated user |
| `role` | varchar(20) | | Role in class: "trainer" or "trainee" |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Purpose:** Links users to classes and defines their logical role within that class (distinct from their system role).

**Validation:**
- `class_id`: required, exists in classes
- `user_id`: required, exists in users
- `role`: required, one of: trainer, trainee

### Inventory Tables

#### 6. `instrument_types`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Type identifier |
| `name` | varchar(50) | unique | Instrument type (e.g., Violin, Guitar) |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 7. `instruments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Instrument identifier |
| `name` | varchar(100) | | Instrument name/description |
| `instrument_type_id` | bigint | FK→instrument_types.id | Instrument type |
| `unique_code` | varchar(100) | unique | Inventory code/serial number |
| `condition` | varchar(50) | indexed, default: 'good' | Physical condition |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |
| `deleted_at` | timestamp | nullable | Soft delete |

**Validation:**
- `name`: required, max 255
- `unique_code`: required, unique, max 255
- `instrument_type_id`: required, exists
- `condition`: optional, max 255
- `availability`: optional, max 255
- `description`: optional, text

#### 8. `instrument_assignments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Assignment identifier |
| `instrument_id` | bigint | FK→instruments.id | Assigned instrument |
| `user_id` | bigint | FK→users.id | Recipient user |
| `assigned_at` | datetime | | Assignment timestamp |
| `returned_at` | datetime | nullable | Return timestamp |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 9. `instrument_maintenance`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Maintenance record identifier |
| `instrument_id` | bigint | FK→instruments.id | Maintained instrument |
| `description` | text | | Maintenance description |
| `date` | date | | Maintenance date |
| `notes` | text | nullable | Additional notes |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 10. `clothing_items`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Item identifier |
| `category` | varchar(100) | | Item category (uniform, accessory, etc.) |
| `size` | varchar(20) | nullable | Size specification |
| `quantity` | integer | default: 0 | Available quantity |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 11. `clothing_assignments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Assignment identifier |
| `item_id` | bigint | FK→clothing_items.id | Assigned item |
| `user_id` | bigint | FK→users.id | Recipient user |
| `assigned_at` | datetime | | Assignment timestamp |
| `returned_at` | datetime | nullable | Return timestamp |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### Training & Education Tables

#### 12. `training_sessions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Session identifier |
| `class_id` | bigint | FK→classes.id | Associated class |
| `trainer_id` | bigint | FK→users.id | Conducting trainer |
| `subject` | varchar(200) | | Session subject/topic |
| `date` | date | indexed | Session date |
| `start_time` | time | | Session start time |
| `end_time` | time | | Session end time |
| `location` | varchar(150) | nullable | Physical location |
| `description` | text | nullable | Detailed description |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Validation:**
- `class_id`: required, exists
- `trainer_id`: required, exists
- `subject`: required, max 200
- `date`: required, date format
- `start_time`, `end_time`: required, time format
- `location`: optional, max 150
- `description`: optional, text

#### 13. `session_attendance`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Attendance record identifier |
| `session_id` | bigint | FK→training_sessions.id | Associated session |
| `trainee_id` | bigint | FK→users.id | Attending trainee |
| `status` | varchar(20) | indexed | Attendance status: present/absent/late |
| `confirmation` | varchar(20) | default: 'pending' | Confirmation: accepted/declined/pending |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 14. `homework`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Homework identifier |
| `session_id` | bigint | FK→training_sessions.id | Related session |
| `assign_scope` | varchar(20) | | Assignment scope: "class" or "trainee" |
| `description` | text | | Homework description/instructions |
| `due_date` | date | nullable | Submission deadline |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 15. `homework_submissions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Submission identifier |
| `homework_id` | bigint | FK→homework.id | Associated homework |
| `trainee_id` | bigint | FK→users.id | Submitting trainee |
| `file_url` | varchar(255) | nullable | Uploaded file URL |
| `notes` | text | nullable | Submission notes |
| `submitted_at` | datetime | nullable | Submission timestamp |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Special Access:** Trainees can only CRUD their own submissions via `trainee.owner` middleware.

#### 16. `performance_reviews`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Review identifier |
| `trainee_id` | bigint | FK→users.id | Reviewed trainee |
| `trainer_id` | bigint | FK→users.id | Reviewing trainer |
| `session_id` | bigint | FK→training_sessions.id, nullable | Related session |
| `rating` | integer | nullable | Numeric rating |
| `notes` | text | nullable | Review notes |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### Learning Resources

#### 17. `library_materials`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Material identifier |
| `title` | varchar(200) | | Material title |
| `description` | text | nullable | Material description |
| `file_url` | varchar(255) | nullable | File storage URL |
| `instrument_type_id` | bigint | FK→instrument_types.id, nullable | Related instrument type |
| `uploaded_by` | bigint | FK→users.id | Uploader (trainer) |
| `uploaded_at` | datetime | nullable | Upload timestamp |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### Events & Activities

#### 18. `events`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Event identifier |
| `title` | varchar(200) | | Event title |
| `description` | text | nullable | Event description |
| `date` | date | nullable | Event date |
| `location` | varchar(150) | nullable | Event location |
| `created_by` | bigint | FK→users.id | Event creator |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 19. `event_participants`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Participant record identifier |
| `event_id` | bigint | FK→events.id | Associated event |
| `user_id` | bigint | FK→users.id | Participating user |
| `role` | varchar(50) | nullable | Participation role: performer/attendee/volunteer |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

### Administrative Tables

#### 20. `user_assignments`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Assignment identifier |
| `user_id` | bigint | FK→users.id | Assigned user |
| `class_id` | bigint | FK→classes.id, nullable | Assigned class |
| `department_id` | bigint | FK→departments.id, nullable | Assigned department |
| `instrument_id` | bigint | FK→instruments.id, nullable | Assigned instrument |
| `start_date` | date | | Assignment start date |
| `end_date` | date | nullable | Assignment end date |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

**Purpose:** Historical record of user assignments to organizational units and instruments.

#### 21. `memberships`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Membership identifier |
| `user_id` | bigint | FK→users.id | Member user |
| `status` | varchar(20) | default: 'active' | Status: active/inactive/graduated |
| `start_date` | date | nullable | Membership start date |
| `end_date` | date | nullable | Membership end date |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

#### 22. `reports_log`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | bigint | PK | Report identifier |
| `created_by` | bigint | FK→users.id | Report creator |
| `type` | varchar(100) | | Report type |
| `created_at_report` | datetime | | Logical report timestamp |
| `created_at` | timestamp | | |
| `updated_at` | timestamp | | |

---

## API Architecture

### Base Configuration

- **Base URL:** `http://localhost:8000/api`
- **Authentication:** Bearer token in `Authorization` header
- **Content-Type:** `application/json`
- **Accept:** `application/json`

### Response Format

All API responses use a standardized format via the `ApiResponse` trait:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... } or [ ... ]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": "Detailed error information or validation errors"
}
```

### Controllers Structure

All controllers are located in `app/Http/Controllers/Api/` and use the `ApiResponse` trait for consistent responses.

Key controllers:
- `AuthController` - Authentication (login/logout)
- `UserController` - User management
- `RoleController` - Role management
- `DepartmentController` - Department management
- `ClasController` - Class management
- `ClassMemberController` - Class membership
- `MembershipController` - Club membership
- `InstrumentController` - Instrument inventory
- `InstrumentTypeController` - Instrument types
- `InstrumentAssignmentController` - Instrument assignments
- `InstrumentMaintenanceController` - Maintenance records
- `ClothingItemController` - Clothing inventory
- `ClothingAssignmentController` - Clothing assignments
- `LibraryMaterialController` - Learning materials
- `TrainingSessionController` - Training sessions
- `SessionAttendanceController` - Attendance tracking
- `HomeworkController` - Homework assignments
- `HomeworkSubmissionController` - Homework submissions
- `PerformanceReviewController` - Performance evaluations
- `EventController` - Event management
- `EventParticipantController` - Event participation
- `UserAssignmentController` - User assignment history
- `ReportsLogController` - Report logging

---

## Authentication & Authorization

### Authentication Flow

1. **Login** (`POST /api/login`)
   - Client sends email and password
   - Server validates credentials
   - On success, creates Sanctum token
   - Returns: `{ success: true, data: { user, token }, message: "Login successful" }`

2. **Authenticated Requests**
   - Client includes token: `Authorization: Bearer {token}`
   - All `/api/*` routes (except `/api/login`) require `auth:sanctum` middleware

3. **Logout** (`POST /api/logout`)
   - Revokes current access token
   - Client should discard stored token

### Token Management

- Tokens stored in `personal_access_tokens` table
- Token name: `api_token`
- No expiration by default (configurable in `config/sanctum.php`)
- Tokens can be revoked individually

---

## Roles & Permissions

### System Roles

The system defines 8 distinct roles with hierarchical permissions:

#### 1. Admin
**Full System Access**
- Complete CRUD on all resources
- User management (create/update/delete users)
- Role management
- Department and class administration
- Inventory management (instruments, clothing)
- Training session oversight
- Event creation and management
- Report generation
- No scope restrictions

#### 2. Leader (Club Leader)
**Organization-Wide Leadership**
- Nearly equivalent to Admin
- User management capabilities
- Department and class administration
- Inventory management
- Training and event oversight
- Membership management
- Report generation
- Typically combined with Admin in permissions: `role:Admin,leader`

#### 3. Department Leader
**Department-Level Authority**
- Can manage:
  - Departments they lead
  - Classes within their departments
  - Users assigned to their departments
  - Instruments and clothing for their area
  - Training sessions in their department classes
- Cannot:
  - Access other departments
  - Manage roles or system-wide users
  - Create reports outside their scope

**Middleware:** `department.access` filters visible departments

#### 4. Class Leader
**Class-Level Authority**
- Can manage:
  - Their assigned class(es)
  - Class members (trainees and trainers)
  - Training sessions for their class
  - Instrument/clothing assignments for class members
  - Some session and homework operations
- Cannot:
  - Access other classes
  - Modify department settings
  - Manage users globally

**Middleware:** `class.access` filters visible classes

#### 5. Trainer
**Teaching & Evaluation Role**
- Can:
  - Create and manage training sessions for assigned classes
  - Create homework assignments
  - Record session attendance
  - Create performance reviews for trainees
  - Upload library materials
  - View class members and schedules
- Cannot:
  - Manage class structure or membership
  - Access administrative functions
  - Modify inventory

**Scope:** Limited to classes where they are assigned as trainer

#### 6. Trainee
**Student Role - Read-Only + Own Submissions**
- Can view:
  - Class members in their enrolled classes
  - Training sessions for their classes
  - Homework assigned to their classes
  - Their own performance reviews
- Can fully manage:
  - Their own homework submissions (create/read/update/delete)
- Cannot:
  - Modify class data, sessions, or homework assignments
  - View or modify other trainees' submissions
  - Access classes they're not enrolled in
  - Access administrative features

**Special Middleware:** `trainee.owner` enforces submission ownership

#### 7. Inventory Manager
**Asset Management Role**
- Full CRUD on:
  - Instrument types and instruments
  - Instrument assignments and maintenance
  - Clothing items and assignments
  - Library materials
- Can:
  - Track inventory status and condition
  - Generate inventory reports
  - Export inventory data (Excel/CSV)
- Cannot:
  - Manage users, classes, or training
  - Access sessions or homework

#### 8. Individual Affair
**Administrative Support Role**
- Can manage:
  - User memberships (status, dates)
  - Events and event participants
  - User assignments (historical records)
  - Reports log
  - Some user data updates
- Cannot:
  - Modify core organizational structure
  - Manage training or education features

---

## Middleware System

### Core Middleware

#### 1. `auth:sanctum`
- **Location:** Laravel Sanctum package
- **Purpose:** Validates Bearer token in `Authorization` header
- **Applied to:** All `/api/*` routes except `/api/login`
- **Behavior:** Returns 401 if token invalid/missing

#### 2. `role:{roles}`
- **Location:** Custom middleware in `app/Http/Middleware/`
- **Purpose:** Restricts access based on user's role
- **Syntax:** `role:Admin,leader,trainer` (comma-separated role names)
- **Behavior:**
  - Checks if authenticated user's `role.role_name` matches any in the list
  - Returns 403 if role not allowed
- **Example Usage:**
  ```php
  ->middleware('role:Admin,leader,inventory manager')
  ```

#### 3. `department.access`
- **Location:** Custom middleware
- **Purpose:** Filters visible departments based on user's role and assignments
- **Applies to:** Department routes
- **Behavior:**
  - Admin/Leader: see all departments
  - Department Leader: see only departments they lead
  - Others: see departments they're assigned to via class membership

#### 4. `class.access`
- **Location:** Custom middleware
- **Purpose:** Filters visible classes based on user's role and membership
- **Applies to:** Class and class member routes
- **Behavior:**
  - Admin/Leader: see all classes
  - Department Leader: see classes in their departments
  - Class Leader: see their assigned classes
  - Trainer/Trainee: see classes where they're members

#### 5. `trainee.owner`
- **Location:** `app/Http/Middleware/IsTraineeOwner.php`
- **Purpose:** Ensures trainees only manage their own homework submissions
- **Applies to:** Homework submission create/update/delete
- **Behavior:**
  - On `POST`: Automatically sets `trainee_id` to `auth()->id()` (ignores client input)
  - On `PUT/PATCH/DELETE`: Verifies `submission.trainee_id === auth()->id()`
  - Returns 403 if trainee attempts to modify another's submission

#### 6. `resource.owner`
- **Location:** Custom middleware
- **Purpose:** Restricts access to resources owned by the user
- **Applies to:** Performance reviews
- **Behavior:** Ensures user can only view/modify their own reviews (unless privileged role)

#### 7. `ApplyRoleScope`
- **Location:** `app/Http/Middleware/ApplyRoleScope.php`
- **Purpose:** Stores authenticated user in application container
- **Behavior:** Makes `app('auth.user')` available globally for scoping queries

---

## API Endpoints Reference

### Authentication

```
POST   /api/login          AuthController@login       (public)
POST   /api/logout         AuthController@logout      (auth:sanctum)
```

### Users & Roles

```
GET    /api/users                   UserController@index       (auth:sanctum)
POST   /api/users                   UserController@store       (auth:sanctum, role:Admin,leader,individual affair)
GET    /api/users/{id}              UserController@show        (auth:sanctum)
PUT    /api/users/{id}              UserController@update      (auth:sanctum, role:Admin,leader,individual affair)
DELETE /api/users/{id}              UserController@destroy     (auth:sanctum, role:Admin,leader,individual affair)

GET    /api/roles                   RoleController@index       (auth:sanctum)
POST   /api/roles                   RoleController@store       (auth:sanctum, role:Admin,leader)
GET    /api/roles/{id}              RoleController@show        (auth:sanctum)
PUT    /api/roles/{id}              RoleController@update      (auth:sanctum, role:Admin,leader)
DELETE /api/roles/{id}              RoleController@destroy     (auth:sanctum, role:Admin,leader)
```

### Organization

```
GET    /api/departments             DepartmentController@index     (auth:sanctum, department.access)
POST   /api/departments             DepartmentController@store     (auth:sanctum, department.access, role:Admin,leader,department leader)
GET    /api/departments/{id}        DepartmentController@show      (auth:sanctum, department.access)
PUT    /api/departments/{id}        DepartmentController@update    (auth:sanctum, department.access, role:Admin,leader,department leader)
DELETE /api/departments/{id}        DepartmentController@destroy   (auth:sanctum, department.access, role:Admin,leader,department leader)

GET    /api/myclasses               ClasController@index           (auth:sanctum, class.access)
POST   /api/myclasses               ClasController@store           (auth:sanctum, class.access, role:Admin,leader,department leader)
GET    /api/myclasses/{id}          ClasController@show            (auth:sanctum, class.access)
PUT    /api/myclasses/{id}          ClasController@update          (auth:sanctum, class.access, role:Admin,leader,department leader,class leader)
DELETE /api/myclasses/{id}          ClasController@destroy         (auth:sanctum, class.access, role:Admin,leader,department leader)

GET    /api/classmembers            ClassMemberController@index    (auth:sanctum, class.access)
POST   /api/classmembers            ClassMemberController@store    (auth:sanctum, role:Admin,leader,department leader,class leader)
GET    /api/classmembers/{id}       ClassMemberController@show     (auth:sanctum, class.access)
PUT    /api/classmembers/{id}       ClassMemberController@update   (auth:sanctum, role:Admin,leader,department leader,class leader)
DELETE /api/classmembers/{id}       ClassMemberController@destroy  (auth:sanctum, role:Admin,leader,department leader,class leader)

GET    /api/memberships             MembershipController@index     (auth:sanctum)
POST   /api/memberships             MembershipController@store     (auth:sanctum, role:Admin,leader,individual affair)
GET    /api/memberships/{id}        MembershipController@show      (auth:sanctum)
PUT    /api/memberships/{id}        MembershipController@update    (auth:sanctum, role:Admin,leader,individual affair)
DELETE /api/memberships/{id}        MembershipController@destroy   (auth:sanctum, role:Admin,leader,individual affair)
```

### Inventory - Instruments

```
GET    /api/instrument-types        InstrumentTypeController@index     (auth:sanctum, role:Admin,leader,inventory manager)
POST   /api/instrument-types        InstrumentTypeController@store     (auth:sanctum, role:Admin,leader,inventory manager)
GET    /api/instrument-types/{id}   InstrumentTypeController@show      (auth:sanctum, role:Admin,leader,inventory manager)
PUT    /api/instrument-types/{id}   InstrumentTypeController@update    (auth:sanctum, role:Admin,leader,inventory manager)
DELETE /api/instrument-types/{id}   InstrumentTypeController@destroy   (auth:sanctum, role:Admin,leader,inventory manager)

GET    /api/instruments             InstrumentController@index         (auth:sanctum, role:Admin,leader,inventory manager,department leader)
POST   /api/instruments             InstrumentController@store         (auth:sanctum, role:Admin,leader,inventory manager,department leader)
GET    /api/instruments/{id}        InstrumentController@show          (auth:sanctum, role:Admin,leader,inventory manager,department leader)
PUT    /api/instruments/{id}        InstrumentController@update        (auth:sanctum, role:Admin,leader,inventory manager,department leader)
DELETE /api/instruments/{id}        InstrumentController@destroy       (auth:sanctum, role:Admin,leader,inventory manager,department leader)

GET    /api/instrument-assignments          InstrumentAssignmentController@index    (auth:sanctum, role:Admin,leader,inventory manager,department leader)
POST   /api/instrument-assignments          InstrumentAssignmentController@store    (auth:sanctum, role:Admin,leader,inventory manager,department leader)
GET    /api/instrument-assignments/{id}     InstrumentAssignmentController@show     (auth:sanctum, role:Admin,leader,inventory manager,department leader)
PUT    /api/instrument-assignments/{id}     InstrumentAssignmentController@update   (auth:sanctum, role:Admin,leader,inventory manager,department leader)
DELETE /api/instrument-assignments/{id}     InstrumentAssignmentController@destroy  (auth:sanctum, role:Admin,leader,inventory manager,department leader)

GET    /api/instrument-maintenances         InstrumentMaintenanceController@index   (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
POST   /api/instrument-maintenances         InstrumentMaintenanceController@store   (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
GET    /api/instrument-maintenances/{id}    InstrumentMaintenanceController@show    (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
PUT    /api/instrument-maintenances/{id}    InstrumentMaintenanceController@update  (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
DELETE /api/instrument-maintenances/{id}    InstrumentMaintenanceController@destroy (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
```

### Inventory - Clothing

```
GET    /api/clothing-items          ClothingItemController@index       (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
POST   /api/clothing-items          ClothingItemController@store       (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
GET    /api/clothing-items/{id}     ClothingItemController@show        (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
PUT    /api/clothing-items/{id}     ClothingItemController@update      (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
DELETE /api/clothing-items/{id}     ClothingItemController@destroy     (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)

GET    /api/clothing-assignments        ClothingAssignmentController@index     (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
POST   /api/clothing-assignments        ClothingAssignmentController@store     (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
GET    /api/clothing-assignments/{id}   ClothingAssignmentController@show      (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
PUT    /api/clothing-assignments/{id}   ClothingAssignmentController@update    (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
DELETE /api/clothing-assignments/{id}   ClothingAssignmentController@destroy   (auth:sanctum, role:Admin,leader,inventory manager,department leader,class leader)
```

### Learning Resources

```
GET    /api/library-materials       LibraryMaterialController@index    (auth:sanctum)
POST   /api/library-materials       LibraryMaterialController@store    (auth:sanctum, role:Admin,leader,inventory manager,trainer)
GET    /api/library-materials/{id}  LibraryMaterialController@show     (auth:sanctum)
PUT    /api/library-materials/{id}  LibraryMaterialController@update   (auth:sanctum, role:Admin,leader,inventory manager,trainer)
DELETE /api/library-materials/{id}  LibraryMaterialController@destroy  (auth:sanctum, role:Admin,leader,inventory manager)
```

### Training & Education

```
GET    /api/training-sessions       TrainingSessionController@index    (auth:sanctum)
POST   /api/training-sessions       TrainingSessionController@store    (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
GET    /api/training-sessions/{id}  TrainingSessionController@show     (auth:sanctum)
PUT    /api/training-sessions/{id}  TrainingSessionController@update   (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
DELETE /api/training-sessions/{id}  TrainingSessionController@destroy  (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)

GET    /api/session-attendances         SessionAttendanceController@index      (auth:sanctum)
POST   /api/session-attendances         SessionAttendanceController@store      (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
GET    /api/session-attendances/{id}    SessionAttendanceController@show       (auth:sanctum)
PUT    /api/session-attendances/{id}    SessionAttendanceController@update     (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
DELETE /api/session-attendances/{id}    SessionAttendanceController@destroy    (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)

GET    /api/homeworks               HomeworkController@index           (auth:sanctum)
POST   /api/homeworks               HomeworkController@store           (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
GET    /api/homeworks/{id}          HomeworkController@show            (auth:sanctum)
PUT    /api/homeworks/{id}          HomeworkController@update          (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)
DELETE /api/homeworks/{id}          HomeworkController@destroy         (auth:sanctum, class.access, role:Admin,leader,department leader,class leader,trainer)

GET    /api/homework-submissions        HomeworkSubmissionController@index     (auth:sanctum)
POST   /api/homework-submissions        HomeworkSubmissionController@store     (auth:sanctum, trainee.owner, role:Admin,leader,department leader,class leader,trainer,trainee)
GET    /api/homework-submissions/{id}   HomeworkSubmissionController@show      (auth:sanctum)
PUT    /api/homework-submissions/{id}   HomeworkSubmissionController@update    (auth:sanctum, trainee.owner, role:Admin,leader,department leader,class leader,trainer,trainee)
DELETE /api/homework-submissions/{id}   HomeworkSubmissionController@destroy   (auth:sanctum, trainee.owner, role:Admin,leader,department leader,class leader,trainer,trainee)

GET    /api/performance-reviews         PerformanceReviewController@index      (auth:sanctum, resource.owner)
POST   /api/performance-reviews         PerformanceReviewController@store      (auth:sanctum, resource.owner, role:Admin,leader,department leader,trainer)
GET    /api/performance-reviews/{id}    PerformanceReviewController@show       (auth:sanctum, resource.owner)
PUT    /api/performance-reviews/{id}    PerformanceReviewController@update     (auth:sanctum, resource.owner, role:Admin,leader,department leader,trainer)
DELETE /api/performance-reviews/{id}    PerformanceReviewController@destroy    (auth:sanctum, resource.owner, role:Admin,leader,department leader,trainer)
```

### Events

```
GET    /api/events                  EventController@index              (auth:sanctum)
POST   /api/events                  EventController@store              (auth:sanctum, role:Admin,leader,individual affair)
GET    /api/events/{id}             EventController@show               (auth:sanctum)
PUT    /api/events/{id}             EventController@update             (auth:sanctum, role:Admin,leader,individual affair)
DELETE /api/events/{id}             EventController@destroy            (auth:sanctum, role:Admin,leader,individual affair)

GET    /api/event-participants          EventParticipantController@index       (auth:sanctum)
POST   /api/event-participants          EventParticipantController@store       (auth:sanctum, role:Admin,leader,department leader,individual affair)
GET    /api/event-participants/{id}     EventParticipantController@show        (auth:sanctum)
PUT    /api/event-participants/{id}     EventParticipantController@update      (auth:sanctum, role:Admin,leader,department leader,individual affair)
DELETE /api/event-participants/{id}     EventParticipantController@destroy     (auth:sanctum, role:Admin,leader,department leader,individual affair)
```

### Administration

```
GET    /api/user-assignments            UserAssignmentController@index         (auth:sanctum)
POST   /api/user-assignments            UserAssignmentController@store         (auth:sanctum, role:Admin,leader,individual affair)
GET    /api/user-assignments/{id}       UserAssignmentController@show          (auth:sanctum)
PUT    /api/user-assignments/{id}       UserAssignmentController@update        (auth:sanctum, role:Admin,leader,individual affair)
DELETE /api/user-assignments/{id}       UserAssignmentController@destroy       (auth:sanctum, role:Admin,leader,individual affair)

GET    /api/reports-logs                ReportsLogController@index             (auth:sanctum)
POST   /api/reports-logs                ReportsLogController@store             (auth:sanctum, role:Admin,leader,individual affair)
GET    /api/reports-logs/{id}           ReportsLogController@show              (auth:sanctum)
PUT    /api/reports-logs/{id}           ReportsLogController@update            (auth:sanctum, role:Admin,leader,individual affair)
DELETE /api/reports-logs/{id}           ReportsLogController@destroy           (auth:sanctum, role:Admin,leader,individual affair)
```

---

## Request/Response Patterns

### Standard CRUD Operations

All resource controllers follow Laravel's RESTful conventions:

- **Index (List):** `GET /api/{resource}`
  - Returns array of resources with optional filtering
  - Supports query parameters for search, filtering, pagination
  
- **Show (Get One):** `GET /api/{resource}/{id}`
  - Returns single resource by ID
  - Returns 404 if not found
  
- **Store (Create):** `POST /api/{resource}`
  - Accepts JSON body with resource fields
  - Returns created resource with 201 status
  - Validates input and returns 422 on validation failure
  
- **Update:** `PUT/PATCH /api/{resource}/{id}`
  - Accepts partial or full JSON body
  - Returns updated resource
  - Returns 404 if not found, 422 on validation failure
  
- **Destroy (Delete):** `DELETE /api/{resource}/{id}`
  - Soft deletes where applicable
  - Returns 204 No Content or success message
  - Returns 404 if not found

### Query Filtering

Many endpoints support query parameters for filtering:

**Training Sessions Example:**
```
GET /api/training-sessions?class_id=5&date=2025-12-01
```

**Instruments Example:**
```
GET /api/instruments?type_id=3&condition=good&availability=available&search=violin
```

**Common Parameters:**
- `search` - Text search across relevant fields
- `{entity}_id` - Filter by related entity
- `status` - Filter by status field
- `date` - Filter by date (sessions, events)
- `type` - Filter by type category

### Validation Errors

When validation fails, the API returns 422 with detailed errors:

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "role_id": ["The selected role id is invalid."]
  }
}
```

---

## Data Models & Relationships

### Model Traits

#### ApiResponse Trait
**Location:** `app/Http/Traits/ApiResponse.php`

All controllers use this trait for consistent responses:

```php
protected function success($data = null, ?string $message = null, int $code = 200): JsonResponse
protected function error(string $message, int $code = 400, $errors = null): JsonResponse
```

#### HasRoleScopes Trait
**Location:** `app/Models/Traits/HasRoleScopes.php`

Applied to `User` model for role-based query scoping:

**Role Checking Methods:**
- `isLeader()` - Returns true if user's role is "leader"
- `isDepartmentLeader()` - Returns true if role is "department leader"
- `isClassLeader()` - Returns true if role is "class leader"
- `isTrainer()` - Returns true if role is "trainer"
- `isTrainee()` - Returns true if role is "trainee"

**Access Scope Methods:**
- `getAccessibleDepartmentIds()` - Returns array of department IDs user can access
- `getAccessibleClassIds()` - Returns array of class IDs user can access
- `getAccessibleUserIds()` - Returns array of user IDs in user's scope

**Query Scopes:**
- `scopeAccessibleBy($query, User $user)` - Filters query to accessible records

### Key Model Relationships

#### User Model
```php
belongsTo: Role
hasMany: TrainingSession (as trainer)
hasMany: ClassMember
hasMany: Membership
hasMany: HomeworkSubmission (as trainee)
hasMany: PerformanceReview (as trainee and trainer)
hasMany: InstrumentAssignment
hasMany: ClothingAssignment
```

#### Department Model
```php
belongsTo: User (leader)
hasMany: Class
scopeAccessibleBy: Filters by user's department access
```

#### Class (Clas) Model
```php
belongsTo: Department
belongsTo: User (class_leader)
hasMany: ClassMember
hasMany: TrainingSession
scopeAccessibleBy: Filters by user's class access
```

#### TrainingSession Model
```php
belongsTo: Class
belongsTo: User (trainer)
hasMany: SessionAttendance
hasMany: Homework
scopeAccessibleBy: Trainees see sessions for enrolled classes
```

#### Homework Model
```php
belongsTo: TrainingSession
hasMany: HomeworkSubmission
scopeAccessibleBy: Trainees see homework for enrolled classes
```

#### HomeworkSubmission Model
```php
belongsTo: Homework
belongsTo: User (trainee)
scopeAccessibleBy: Trainees see only their own submissions
```

#### Instrument Model
```php
belongsTo: InstrumentType
hasMany: InstrumentAssignment
hasMany: InstrumentMaintenance
softDeletes: Yes
```

---

## Additional Features

### Excel/CSV Export

Several controllers provide export functionality (via Maatwebsite/Excel):

**Instruments:**
```
GET /api/instruments/export-excel
GET /api/instruments/export-csv
```

Returns downloadable Excel or CSV file with all instrument records.

### Soft Deletes

The following models support soft deletes (recoverable via `restore()` methods):
- `User`
- `Instrument`

Soft-deleted records are excluded from queries by default but can be retrieved with `withTrashed()` or `onlyTrashed()` scopes.

### Model Scoping System

The system uses Laravel query scopes extensively to implement data access boundaries:

**Example: Trainee viewing training sessions**
```php
TrainingSession::accessibleBy($user)->get();
```

This automatically:
1. Identifies user's role
2. Retrieves accessible class IDs
3. Filters sessions to only those classes
4. Returns scoped collection

**Scope Implementation Pattern:**
```php
public function scopeAccessibleBy($query, User $user)
{
    if ($user->isLeader()) {
        return $query; // No restrictions
    }
    
    if ($user->isTrainee()) {
        $classIds = $user->getAccessibleClassIds();
        return $query->whereIn('class_id', $classIds);
    }
    
    // Other role logic...
}
```

This ensures data security at the model layer, independent of controller logic.

---

## Security Considerations

### Input Validation

All create/update operations validate input using Laravel's request validation:

```php
$validated = $request->validate([
    'email' => 'required|email|unique:users',
    'password' => 'required|min:8',
    'role_id' => 'required|exists:roles,id'
]);
```

### Password Hashing

Passwords are hashed using bcrypt (configured in `config/hashing.php`):
```php
'password' => Hash::make($request->password)
```

### Authorization Layers

Security is enforced at multiple layers:
1. **Route Middleware:** `auth:sanctum`, `role:*`
2. **Custom Middleware:** `department.access`, `class.access`, `trainee.owner`
3. **Model Scopes:** `accessibleBy()` filters at query level
4. **Controller Logic:** Additional checks within controller methods

### Trainee Submission Protection

The `trainee.owner` middleware provides critical security:

**On Create:**
```php
if ($user->isTrainee()) {
    $data['trainee_id'] = $user->id; // Force ownership
}
```

**On Update/Delete:**
```php
if ($user->isTrainee() && $submission->trainee_id !== $user->id) {
    abort(403, 'Unauthorized'); // Block access
}
```

This prevents privilege escalation where a trainee might attempt to modify another trainee's `trainee_id` in the request body.

---

## Database Seeding

### Default Roles

The system should seed default roles on installation:

```php
'Admin'
'leader'
'department leader'
'class leader'
'trainer'
'trainee'
'inventory manager'
'individual affair'
```

### Sample Data

For development/testing, seeders can create:
- Sample users for each role
- Departments and classes
- Training sessions
- Homework and submissions
- Instruments and assignments

---

## Related Documentation

- **API_ENDPOINTS.md** - Complete endpoint listing
- **API_DOCUMENTATION.md** - Detailed API usage guide
- **TRAINEE_PERMISSIONS.md** - Trainee access implementation details
- **ROLE_SCOPES_GUIDE.md** - Comprehensive role-based scoping guide
- **QUICK_START_SCOPES.md** - Quick reference for using scopes

---

## Summary

The Music Club Management System backend is a robust, scalable API built on Laravel 12 with comprehensive role-based access control. It manages 21 core tables spanning organizational structure, training, inventory, events, and administration. The system implements an 8-role hierarchy with sophisticated scoping mechanisms that ensure users access only data within their authorized boundaries.

Key strengths:
- **Granular Permissions:** 8 distinct roles with fine-grained access control
- **Data Scoping:** Model-level query scopes prevent unauthorized access
- **Standardized API:** Consistent JSON responses via ApiResponse trait
- **Secure by Default:** Multiple authorization layers (routes, middleware, models)
- **Trainee-First Design:** Special protections for student data ownership
- **RESTful Design:** Standard CRUD operations across all resources
- **Extensible:** Traits and scopes make adding new resources straightforward

The system is production-ready and follows Laravel best practices for security, validation, and architecture.
