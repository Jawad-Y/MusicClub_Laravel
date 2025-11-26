# Music Club API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All endpoints (except login) require authentication using Laravel Sanctum tokens.

### Headers Required
```
Accept: application/json
Content-Type: application/json
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### Login
**POST** `/login`

**Public endpoint** - No authentication required

**Request:**
```json
{
  "email": "admin@musicclub.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "Admin User",
      "email": "admin@musicclub.com",
      "role": {
        "id": 1,
        "role_name": "Admin"
      }
    },
    "token": "1|abc123..."
  }
}
```

---

### Logout
**POST** `/logout`

**Authentication:** Required

**Response (200):**
```json
{
  "status": true,
  "message": "Logged out successfully"
}
```

---

## User Management

### List Users
**GET** `/users`

**Authentication:** Required  
**Permissions:** All authenticated users

**Query Parameters:**
- `per_page` (optional): Number of results per page (default: 15)

**Response (200):**
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "status": "active",
        "role": {
          "id": 2,
          "role_name": "Member"
        }
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 15,
      "total": 50
    }
  }
}
```

---

### Create User
**POST** `/users`

**Authentication:** Required  
**Permissions:** Admin, Leader, Individual Affair

**Request:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "0987654321",
  "role_id": 3,
  "status": "active",
  "password": "password123"
}
```

**Validation Rules:**
- `full_name`: required, string, max:255
- `email`: required, email, unique
- `phone`: required, string
- `role_id`: required, exists in roles table
- `status`: required, in:active,inactive
- `password`: required, min:8

**Response (201):**
```json
{
  "status": true,
  "message": "User created successfully",
  "data": {
    "id": 51,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": {...}
  }
}
```

---

### Show User
**GET** `/users/{id}`

**Authentication:** Required

**Response (200):**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": {...},
    "memberships": [...],
    "led_departments": [...]
  }
}
```

---

### Update User
**PUT/PATCH** `/users/{id}`

**Authentication:** Required  
**Permissions:** Admin, Leader, Individual Affair

**Request:**
```json
{
  "full_name": "John Updated",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "status": true,
  "message": "User updated successfully",
  "data": {...}
}
```

---

### Delete User
**DELETE** `/users/{id}`

**Authentication:** Required  
**Permissions:** Admin, Leader, Individual Affair

**Response (204):**
No content

---

## Role Management

### List Roles
**GET** `/roles`

**Authentication:** Required

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "role_name": "Admin",
      "description": "Full system access"
    }
  ]
}
```

---

### Create Role
**POST** `/roles`

**Authentication:** Required  
**Permissions:** Admin, Leader

**Request:**
```json
{
  "role_name": "Assistant",
  "description": "Assistant role with limited access"
}
```

---

## Department Management

### List Departments
**GET** `/departments`

**Authentication:** Required  
**Middleware:** `department.access`

**Scoped Access:**
- **Admin/Leader:** All departments
- **Department Leader:** Only their department
- **Others:** Forbidden

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "department_name": "Strings",
      "leader": {
        "id": 5,
        "full_name": "Leader Name"
      },
      "classes": [...]
    }
  ]
}
```

---

### Create Department
**POST** `/departments`

**Authentication:** Required  
**Permissions:** Admin, Leader, Department Leader

**Request:**
```json
{
  "department_name": "Percussion",
  "leader_id": 8
}
```

---

## Class Management

### List Classes
**GET** `/myclasses`

**Authentication:** Required  
**Middleware:** `class.access`

**Scoped Access:**
- **Admin/Leader:** All classes
- **Department Leader:** Classes in their department
- **Class Leader:** Only their assigned class
- **Trainer:** Only classes they teach
- **Member:** Only classes they're enrolled in

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "class_name": "Beginner Violin",
      "department": {...},
      "class_leader": {...},
      "members": [...]
    }
  ]
}
```

---

### Create Class
**POST** `/myclasses`

**Authentication:** Required  
**Permissions:** Admin, Leader, Department Leader, Class Leader

**Request:**
```json
{
  "class_name": "Advanced Piano",
  "department_id": 2,
  "class_leader_id": 10
}
```

---

## Training Sessions

### List Training Sessions
**GET** `/training-sessions`

**Authentication:** Required  
**Middleware:** `class.access`

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "subject": "Music Theory Basics",
      "class": {...},
      "trainer": {...},
      "date": "2025-11-30",
      "start_time": "10:00:00",
      "end_time": "11:30:00",
      "location": "Room 101",
      "description": "Introduction to music theory"
    }
  ]
}
```

---

### Create Training Session
**POST** `/training-sessions`

**Authentication:** Required  
**Permissions:** Admin, Leader, Department Leader, Class Leader, Trainer

**Request:**
```json
{
  "class_id": 1,
  "trainer_id": 5,
  "subject": "Music Theory Basics",
  "date": "2025-11-30",
  "start_time": "10:00:00",
  "end_time": "11:30:00",
  "location": "Room 101",
  "description": "Introduction to music theory"
}
```

---

## Homework Management

### List Homework
**GET** `/homeworks`

**Authentication:** Required  
**Middleware:** `class.access`

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "session": {...},
      "assign_scope": "all",
      "description": "Practice scales",
      "due_date": "2025-12-05"
    }
  ]
}
```

---

### Create Homework
**POST** `/homeworks`

**Request:**
```json
{
  "session_id": 1,
  "assign_scope": "all",
  "description": "Practice C major scale for 30 minutes daily",
  "due_date": "2025-12-05"
}
```

---

## Homework Submissions

### List Homework Submissions
**GET** `/homework-submissions`

**Authentication:** Required  
**Middleware:** `class.access`, `resource.owner`

**Scoped Access:**
- Students see only their submissions
- Trainers/Class Leaders see all submissions in their class

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "homework": {...},
      "trainee": {...},
      "file_url": "/uploads/homework/file.pdf",
      "notes": "Completed assignment",
      "submitted_at": "2025-12-04 15:30:00"
    }
  ]
}
```

---

### Submit Homework
**POST** `/homework-submissions`

**Request:**
```json
{
  "homework_id": 1,
  "trainee_id": 15,
  "file_url": "/uploads/homework/submission.pdf",
  "notes": "Completed all exercises",
  "submitted_at": "2025-12-04 15:30:00"
}
```

---

### Update Homework Submission
**PUT/PATCH** `/homework-submissions/{id}`

**Middleware:** `resource.owner`

**Authorization:**
- Students can only update their own submissions
- Trainers/Class Leaders/Department Leaders can update any

---

## Performance Reviews

### List Performance Reviews
**GET** `/performance-reviews`

**Authentication:** Required  
**Middleware:** `resource.owner`

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "trainee": {...},
      "trainer": {...},
      "session": {...},
      "rating": 8,
      "notes": "Good progress on technique"
    }
  ]
}
```

---

### Create Performance Review
**POST** `/performance-reviews`

**Permissions:** Trainer, Class Leader, Department Leader, Admin, Leader

**Request:**
```json
{
  "trainee_id": 20,
  "trainer_id": 5,
  "session_id": 3,
  "rating": 8,
  "notes": "Excellent improvement in rhythm"
}
```

---

## Instrument Management

### List Instruments
**GET** `/instruments`

**Authentication:** Required

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Violin #5",
      "instrument_type": {
        "id": 1,
        "name": "Violin"
      },
      "unique_code": "VLN-005",
      "condition": "Good"
    }
  ]
}
```

---

### Create Instrument
**POST** `/instruments`

**Permissions:** Admin, Leader, Inventory Manager

**Request:**
```json
{
  "name": "Cello #3",
  "instrument_type_id": 4,
  "unique_code": "CEL-003",
  "condition": "Excellent"
}
```

---

## Events

### List Events
**GET** `/events`

**Authentication:** Required

**Response (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "title": "Winter Concert",
      "description": "Annual winter performance",
      "date": "2025-12-20",
      "location": "Main Hall",
      "created_by": {...},
      "participants": [...]
    }
  ]
}
```

---

### Create Event
**POST** `/events`

**Permissions:** Admin, Leader, Individual Affair

**Request:**
```json
{
  "title": "Spring Recital",
  "description": "Student performances",
  "date": "2026-03-15",
  "location": "Auditorium",
  "created_by": 1
}
```

---

## Reports & Logs

### List API Logs
**GET** `/reports-logs`

**Authentication:** Required

**Scoped Access:**
- **Admin/Leader:** All logs
- **Department Leader:** Logs from their department users
- **Class Leader/Trainer:** Logs from their class members
- **Member:** Only their own logs

**Query Parameters:**
- `type`: Filter by log type
- `created_by`: Filter by user ID
- `date_from`: Start date
- `date_to`: End date
- `per_page`: Results per page

**Response (200):**
```json
{
  "status": true,
  "message": "Logs retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "created_by": 5,
        "creator": {
          "id": 5,
          "full_name": "John Doe",
          "role": {...}
        },
        "type": "[Member|user:5] GET api/homeworks - Status: 200 - IP: 127.0.0.1",
        "created_at_report": "2025-11-26 14:30:00"
      }
    ],
    "meta": {...}
  }
}
```

---

### View Specific Log
**GET** `/reports-logs/{id}`

**Authentication:** Required  
**Authorization:** Policy-based (must have access to view the log)

---

## Error Responses

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Authentication required."
}
```

### 403 Forbidden
```json
{
  "status": false,
  "message": "You do not have permission to access this resource."
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Resource not found."
}
```

### 422 Validation Error
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 500 Server Error
```json
{
  "status": false,
  "message": "An error occurred on the server."
}
```

---

## Rate Limiting

All API endpoints are rate-limited to **60 requests per minute** per user.

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `Retry-After`: Seconds until limit resets (when exceeded)

**Response (429):**
```json
{
  "message": "Too Many Requests"
}
```

---

## Middleware Summary

| Middleware | Routes | Purpose |
|------------|--------|---------|
| `auth:sanctum` | All (except login) | Authentication |
| `user.active` | All authenticated | Ensure user is active |
| `role:...` | Specific actions | Role-based permissions |
| `department.access` | Departments | Department-level access |
| `class.access` | Classes, Sessions, Homework | Class-level access |
| `resource.owner` | Submissions, Reviews | Ownership validation |

---

## Testing with Postman/Insomnia

1. **Login** to get token
2. **Set Authorization Header:** `Bearer {token}`
3. **Set Accept Header:** `application/json`
4. Test endpoints according to your user role
