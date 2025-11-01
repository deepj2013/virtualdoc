# VirtualDoc API Documentation

## Base URLs

- **Development**: `http://localhost:3001`
- **Staging**: `https://staging-api.virtualdoc.com`
- **Production**: `https://api.virtualdoc.com`

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

---

## Universal Admin APIs

### 1. Signup

Create a new Universal Admin account.

**Endpoint:** `POST /api/admin/auth/signup`

**Request Body:**
```json
{
  "email": "admin@virtualdoc.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Field Validation:**
- `email`: Required, valid email format
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number, and special character
- `firstName`: Required, 2-100 characters
- `lastName`: Required, 2-100 characters
- `phone`: Optional, valid phone format

**Success Response (201):**
```json
{
  "success": true,
  "message": "Universal Admin account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@virtualdoc.com",
      "firstName": "John",
      "lastName": "Doe",
      "adminRoleCode": "universal_admin"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Email is required",
    "Password must be at least 8 characters long"
  ]
}
```

- **409 Conflict** - Email already exists
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login

Authenticate Universal Admin and receive access tokens.

**Endpoint:** `POST /api/admin/auth/login`

**Request Body:**
```json
{
  "email": "admin@virtualdoc.com",
  "password": "SecurePass123!"
}
```

**Field Validation:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@virtualdoc.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "super_admin",
      "adminRoleCode": "universal_admin"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request** - Validation error
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Email is required"]
}
```

- **401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

- **403 Forbidden** - Account locked or suspended
```json
{
  "success": false,
  "message": "Account is locked. Please contact support."
}
```

```json
{
  "success": false,
  "message": "Account is suspended. Reason: [reason]"
}
```

---

## Health Check

### Get Service Health

**Endpoint:** `GET /health`

**Response (200):**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error details"], // Only for validation errors
  "error": "Stack trace" // Only in development mode
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation Error) |
| 401 | Unauthorized |
| 403 | Forbidden (Locked/Suspended) |
| 404 | Not Found |
| 409 | Conflict (Duplicate) |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, rate limiting is handled per endpoint:
- Login attempts: 5 failed attempts in 15 minutes triggers account lock
- API calls: To be implemented

---

## Token Information

### Access Token
- **Expires**: 1 hour
- **Contains**: User ID, email, role, admin role code, tenant ID
- **Type**: JWT
- **Use**: Include in `Authorization: Bearer <token>` header

### Refresh Token
- **Expires**: 7 days
- **Purpose**: Obtain new access token
- **Storage**: Should be stored securely (not implemented yet)

---

## Example Requests

### cURL Examples

**Signup:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!"
  }'
```

**Authenticated Request (Future):**
```bash
curl -X GET http://localhost:3001/api/admin/profile \
  -H "Authorization: Bearer <access_token>"
```

---

## Next APIs (To Be Implemented)

- `POST /api/admin/auth/refresh` - Refresh access token
- `POST /api/admin/auth/logout` - Logout and revoke tokens
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `POST /api/admin/auth/forgot-password` - Request password reset
- `POST /api/admin/auth/reset-password` - Reset password

