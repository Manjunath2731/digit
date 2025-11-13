# API Documentation

## Database Schema

### Table: `users`
Stores user authentication and basic information.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | User's name |
| email | VARCHAR(255) | Unique email address |
| phone | VARCHAR(10) | 10-digit phone number |
| password | VARCHAR(255) | Hashed password |
| role | VARCHAR(50) | admin, user, or secondary_user |
| access_level | VARCHAR(50) | full, limited, or view_only |
| status | VARCHAR(20) | active or inactive |
| noofsecuser | INTEGER | Number of secondary users allowed |
| address | TEXT | User's address |
| addressDetails | JSONB | Detailed address object |
| last_login_date | TIMESTAMP | Last login timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Table: `user_device`
Stores device-related information for each user.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | Foreign key to users table |
| device_id | VARCHAR(255) | Device identifier |
| saviour | VARCHAR(50) | Product type (saviour, ni-sensu, nivarak) |
| device_sim_no | VARCHAR(20) | Device SIM number |
| house_type | VARCHAR(50) | apartment, villa, bungalow, townhouse |
| sensor_type | VARCHAR(50) | Sensor type |
| last_login_device | VARCHAR(255) | Last device used for login |
| os | VARCHAR(100) | Operating system |
| browser | VARCHAR(100) | Browser used |
| is_primary | BOOLEAN | Is this the primary device |
| status | VARCHAR(20) | active or inactive |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin@digit.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@digit.com",
    "role": "admin",
    "access_level": "full",
    "status": "active"
  }
}
```

#### POST `/api/auth/register`
Register new primary user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "user"
}
```

### User Management

**All endpoints require Authorization header:**
```
Authorization: Bearer <JWT_TOKEN>
```

#### GET `/api/users`
Get all users with their device information.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 2,
      "name": "Regular User",
      "email": "user@digit.com",
      "phone": "8888888888",
      "role": "user",
      "access_level": "limited",
      "status": "active",
      "noofsecuser": 3,
      "devices": [
        {
          "device_id": "USER-DEVICE-001",
          "saviour": "ni-sensu",
          "device_sim_no": null,
          "house_type": "villa",
          "sensor_type": "sensortype2",
          "is_primary": true,
          "device_status": "active"
        }
      ]
    }
  ]
}
```

#### POST `/api/users`
Create new user with device information.

**Request:**
```json
{
  "email": "newuser@example.com",
  "phone": "9876543210",
  "device": "DEVICE-123",
  "noOfSecUsers": 5,
  "saviour": "saviour",
  "deviceSimNo": "9876543210",
  "houseType": "apartment",
  "sensorType": "sensortype1",
  "address": "123 Main St, New York, NY - 10001",
  "addressDetails": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pinCode": "10001",
    "country": "India",
    "landmark": "Near Central Park"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "name": "DEVICE-123",
    "email": "newuser@example.com",
    "phone": "9876543210",
    "role": "user",
    "access_level": "limited",
    "status": "active",
    "noofsecuser": 5,
    "device": {
      "id": 3,
      "device_id": "DEVICE-123",
      "saviour": "saviour",
      "device_sim_no": "9876543210",
      "house_type": "apartment",
      "sensor_type": "sensortype1",
      "is_primary": true
    }
  }
}
```

#### GET `/api/users/:id`
Get user by ID with device information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Regular User",
    "email": "user@digit.com",
    "devices": [...]
  }
}
```

#### PATCH `/api/users/:id/status`
Update user status.

**Request:**
```json
{
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {...}
}
```

#### DELETE `/api/users/:id`
Delete user (cascades to user_device table).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
