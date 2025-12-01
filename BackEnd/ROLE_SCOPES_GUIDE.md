# Role-Based Scopes Implementation Guide

This document explains the role-based access control (RBAC) system implemented for the Music Club application.

## Role Hierarchy

Based on the attached user roles document:

1. **Leader (Club Leader)** - Top Level
   - Full control over the entire club
   - Can view everything

2. **Department Leader** - Middle Level
   - Oversees multiple classes (a department or section)
   - Manages Class Leaders under them
   - Can view everything within their departments

3. **Class Leader** - Class Level
   - Responsible for managing one class
   - Can view everything within their classes

4. **Trainer**
   - Assigned to classes by Leaders
   - Can view their class information and members

5. **Trainee**
   - Assigned to classes by Leaders
   - Can only view members in the same class and class information

## Implementation Components

### 1. HasRoleScopes Trait

Location: `app/Models/Traits/HasRoleScopes.php`

This trait provides helper methods for User model:

#### Role Check Methods
```php
$user->isLeader()           // Check if user is a Leader
$user->isDepartmentLeader() // Check if user is a Department Leader
$user->isClassLeader()      // Check if user is a Class Leader
$user->isTrainer()          // Check if user is a Trainer
$user->isTrainee()          // Check if user is a Trainee
```

#### Access Methods
```php
$user->getAccessibleDepartmentIds() // Array of department IDs user can access
$user->getAccessibleClassIds()      // Array of class IDs user can access
$user->getAccessibleUserIds()       // Array of user IDs user can access
```

### 2. Query Scopes

#### User Model Scope
```php
// Get all users accessible to the authenticated user
User::accessibleBy(auth()->user())->get();
```

**Access Rules:**
- **Leader**: All users
- **Department Leader**: Users in classes within their departments
- **Class Leader**: Users in their classes
- **Trainee**: Users in the same classes

#### Class Model Scope
```php
// Get all classes accessible to the authenticated user
Clas::accessibleBy(auth()->user())->get();
```

**Access Rules:**
- **Leader**: All classes
- **Department Leader**: Classes in their departments
- **Class Leader**: Their own classes
- **Trainee/Trainer**: Classes they are members of

#### Department Model Scope
```php
// Get all departments accessible to the authenticated user
Department::accessibleBy(auth()->user())->get();
```

**Access Rules:**
- **Leader**: All departments
- **Department Leader**: Their own departments
- **Class Leader**: Departments through their classes
- **Others**: No access

### 3. User Model Relationships

Added relationships to User model:

```php
// Classes this user leads
$user->ledClasses()

// Classes this user is a member of (as trainee or trainer)
$user->classMembers()

// Departments this user leads
$user->ledDepartments()
```

## Usage Examples

### Example 1: Get Accessible Users in a Controller

```php
public function index(Request $request)
{
    $user = $request->user();
    
    // Automatically filtered based on user's role
    $users = User::accessibleBy($user)->get();
    
    return response()->json($users);
}
```

### Example 2: Get Accessible Classes with Relations

```php
public function getClasses(Request $request)
{
    $user = $request->user();
    
    $classes = Clas::accessibleBy($user)
        ->with(['department', 'classLeader', 'members'])
        ->get();
    
    return response()->json($classes);
}
```

### Example 3: Check Access to Specific Class

```php
public function show(Request $request, $classId)
{
    $user = $request->user();
    
    // Will throw 404 if user doesn't have access
    $class = Clas::accessibleBy($user)->findOrFail($classId);
    
    return response()->json($class);
}
```

### Example 4: Get Class Members (Trainee Scenario)

```php
public function getClassmates(Request $request, $classId)
{
    $user = $request->user();
    
    // Verify user can access this class
    $class = Clas::accessibleBy($user)->findOrFail($classId);
    
    // Get members - trainees will only see members in classes they're in
    $members = User::accessibleBy($user)
        ->whereHas('classMembers', function ($query) use ($classId) {
            $query->where('classes.id', $classId);
        })
        ->get();
    
    return response()->json([
        'class' => $class,
        'members' => $members
    ]);
}
```

### Example 5: Department Leader Viewing Their Data

```php
public function getDepartmentData(Request $request, $departmentId)
{
    $user = $request->user();
    
    // Verify user can access this department
    $department = Department::accessibleBy($user)->findOrFail($departmentId);
    
    // Get all classes in this department (filtered by scope)
    $classes = Clas::accessibleBy($user)
        ->where('department_id', $departmentId)
        ->with('members')
        ->get();
    
    return response()->json([
        'department' => $department,
        'classes' => $classes
    ]);
}
```

## Testing the Implementation

### Test Routes (Add to routes/api.php)

```php
use App\Http\Controllers\Examples\RoleScopedController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/role-info', [RoleScopedController::class, 'getUserRoleInfo']);
    Route::get('/accessible-users', [RoleScopedController::class, 'getAccessibleUsers']);
    Route::get('/accessible-classes', [RoleScopedController::class, 'getAccessibleClasses']);
    Route::get('/accessible-departments', [RoleScopedController::class, 'getAccessibleDepartments']);
    Route::get('/class/{classId}/members', [RoleScopedController::class, 'getClassMembers']);
});
```

### Test Scenarios

1. **As a Leader:**
   ```
   GET /api/accessible-users
   → Returns all users in the system
   ```

2. **As a Department Leader:**
   ```
   GET /api/accessible-classes
   → Returns only classes in departments they lead
   ```

3. **As a Class Leader:**
   ```
   GET /api/class/{classId}/members
   → Returns members only if they lead that class
   ```

4. **As a Trainee:**
   ```
   GET /api/accessible-users
   → Returns only users in the same classes
   ```

## Best Practices

1. **Always use scopes in controllers:**
   ```php
   // Good
   $users = User::accessibleBy(auth()->user())->get();
   
   // Bad - no filtering
   $users = User::all();
   ```

2. **Combine with authorization:**
   ```php
   // Use scopes for data filtering
   $class = Clas::accessibleBy($user)->findOrFail($id);
   
   // Use policies for action authorization
   $this->authorize('update', $class);
   ```

3. **Use eager loading with scopes:**
   ```php
   $classes = Clas::accessibleBy($user)
       ->with(['department', 'members'])
       ->get();
   ```

4. **Check role before complex queries:**
   ```php
   if ($user->isLeader()) {
       // Leader-specific logic
       $data = ComplexQuery::all();
   } else {
       $data = ComplexQuery::accessibleBy($user)->get();
   }
   ```

## Database Structure Reference

### Tables Involved

- `users` - User accounts with role_id
- `roles` - Role definitions (Leader, Department Leader, Class Leader, Trainer, Trainee)
- `departments` - Departments with leader_id
- `classes` - Classes with department_id and class_leader_id
- `class_members` - Pivot table (user_id, class_id, role)

### Key Relationships

- User → Role (belongsTo)
- User → Departments (hasMany as leader)
- User → Classes (hasMany as class leader)
- User → Classes (belongsToMany via class_members)
- Department → Classes (hasMany)
- Class → Department (belongsTo)

## Troubleshooting

### Issue: Scope returns empty results

**Check:**
1. User has a valid role assigned
2. User is properly assigned to departments/classes
3. class_members table has correct entries

### Issue: Trainee sees too much data

**Check:**
1. User's role is correctly set to "Trainee"
2. class_members table has user linked to correct classes
3. Scope logic matches case-insensitive role names

### Issue: Department Leader can't see their classes

**Check:**
1. User is set as leader_id in departments table
2. Classes have correct department_id
3. User's role is set to "Department Leader"

## Next Steps

1. Add policy-based authorization for actions (create, update, delete)
2. Implement audit logging for sensitive operations
3. Add caching for frequently accessed scope data
4. Create admin panel for managing role assignments
5. Add API documentation with role-based examples
