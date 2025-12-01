# Role-Based Scopes - Quick Start Guide

## ✅ Implementation Complete

Your Music Club application now has comprehensive role-based access control with the following features:

### User Roles & Their Access

1. **Leader** (Top Level)
   - ✅ Can view everything
   - ✅ Full access to all resources

2. **Department Leader** (Middle Level)
   - ✅ Can view everything in their departments
   - ✅ See all classes in their departments
   - ✅ See all users in those classes

3. **Class Leader** (Class Level)
   - ✅ Can view everything in their classes
   - ✅ See all members in their classes
   - ✅ Manage class training sessions and homework

4. **Trainee**
   - ✅ Can view class members in same enrolled classes
   - ✅ Can view training sessions for enrolled classes (read-only)
   - ✅ Can view homework for enrolled classes (read-only)
   - ✅ Can create, view, update, delete their OWN homework submissions
   - ❌ Cannot update or delete anything else

## How to Use in Controllers

### Example 1: Get Accessible Users
```php
public function index(Request $request)
{
    $user = $request->user();
    $users = User::accessibleBy($user)->get();
    return response()->json($users);
}
```

### Example 2: Get Accessible Classes
```php
public function getClasses(Request $request)
{
    $user = $request->user();
    $classes = Clas::accessibleBy($user)
        ->with(['department', 'classLeader'])
        ->get();
    return response()->json($classes);
}
```

### Example 3: Check User Role
```php
$user = auth()->user();

if ($user->isLeader()) {
    // Leader-specific logic
}

if ($user->isTrainee()) {
    // Trainee-specific logic
}

// Get accessible IDs
$classIds = $user->getAccessibleClassIds();
$departmentIds = $user->getAccessibleDepartmentIds();
```

## Files Modified

### Models
- ✅ `app/Models/User.php` - Added relationships and HasRoleScopes trait
- ✅ `app/Models/Clas.php` - Added scopeAccessibleBy
- ✅ `app/Models/Department.php` - Added scopeAccessibleBy
- ✅ `app/Models/TrainingSession.php` - Added scopeAccessibleBy
- ✅ `app/Models/Homework.php` - Added scopeAccessibleBy
- ✅ `app/Models/HomeworkSubmission.php` - Added scopeAccessibleBy

### New Files
- ✅ `app/Models/Traits/HasRoleScopes.php` - Core role checking logic
- ✅ `app/Http/Middleware/IsTraineeOwner.php` - Trainee ownership enforcement
- ✅ `app/Http/Controllers/Examples/RoleScopedController.php` - Usage examples

### Controllers Updated
- ✅ `app/Http/Controllers/Api/TrainingSessionController.php`
- ✅ `app/Http/Controllers/Api/HomeworkController.php`
- ✅ `app/Http/Controllers/Api/HomeworkSubmissionController.php`
- ✅ `app/Http/Controllers/Api/ClassMemberController.php`

### Configuration
- ✅ `bootstrap/app.php` - Registered trainee.owner middleware
- ✅ `routes/api.php` - Updated route permissions

### Documentation
- ✅ `ROLE_SCOPES_GUIDE.md` - Comprehensive guide
- ✅ `TRAINEE_PERMISSIONS.md` - Trainee-specific documentation
- ✅ `routes/scope-test-routes.php` - Example test routes

## Testing

### Quick Test Commands

```bash
# Test as different roles
php artisan tinker

# Get a trainee user
$trainee = User::where('role_id', 8)->first(); // Trainee role

# Check what they can access
$trainee->isTrainee(); // true
$trainee->getAccessibleClassIds(); // [1, 3] - their classes
$trainee->getAccessibleUserIds(); // Only classmates

# Test scope
User::accessibleBy($trainee)->count(); // Only classmates
Clas::accessibleBy($trainee)->count(); // Only enrolled classes
HomeworkSubmission::accessibleBy($trainee)->count(); // Only their submissions
```

## API Testing

### Test Trainee Endpoints

```bash
# 1. Login as trainee
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainee@example.com","password":"password"}'

# Save the token from response

# 2. View class members (filtered to enrolled classes)
curl -X GET http://localhost:8000/api/classmembers \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. View training sessions (filtered to enrolled classes)
curl -X GET http://localhost:8000/api/training-sessions \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. View homework (filtered to enrolled classes)
curl -X GET http://localhost:8000/api/homeworks \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Submit homework
curl -X POST http://localhost:8000/api/homework-submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "homework_id": 1,
    "trainee_id": 5,
    "file_url": "https://example.com/submission.pdf",
    "notes": "My submission"
  }'

# 6. View own submissions
curl -X GET http://localhost:8000/api/homework-submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

1. ✅ Test with different user roles
2. ✅ Verify trainees cannot access unauthorized data
3. ✅ Test homework submission workflow
4. ✅ Add additional scopes to other models as needed
5. ✅ Implement policy-based authorization for fine-grained control

## Common Issues & Solutions

### Issue: Trainee sees too much data
**Solution:** Ensure user is assigned to classes via `class_members` table

### Issue: Scope returns empty
**Solution:** Check that relationships are properly loaded and role name matches exactly

### Issue: Cannot submit homework
**Solution:** Verify `trainee.owner` middleware is registered in `bootstrap/app.php`

## Support

For detailed information:
- See `ROLE_SCOPES_GUIDE.md` for full implementation details
- See `TRAINEE_PERMISSIONS.md` for trainee-specific permissions
- Check example controller at `app/Http/Controllers/Examples/RoleScopedController.php`
