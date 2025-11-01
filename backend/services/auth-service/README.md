# Auth Service - Universal Admin APIs

## Overview
This service handles authentication for Universal Admin, Sub-Admin, and Tenant Admin users in the VirtualDoc SaaS platform.

## API Endpoints

### Universal Admin Signup
```http
POST /api/admin/auth/signup
Content-Type: application/json

{
  "email": "admin@virtualdoc.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890" // optional
}
```

**Response:**
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

### Universal Admin Login
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@virtualdoc.com",
  "password": "SecurePass123!"
}
```

**Response:**
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
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 3600,
      "tokenType": "Bearer"
    }
  }
}
```

## Project Structure

```
src/
├── config/
│   └── database.ts          # PostgreSQL connection pool
├── controllers/
│   └── AdminController.ts    # Admin signup/login logic
├── helpers/
│   ├── jwt.helper.ts         # JWT token generation/verification
│   ├── password.helper.ts    # Password hashing/validation
│   └── device.helper.ts      # Device fingerprinting
├── routes/
│   └── admin.routes.ts       # Admin API routes
├── services/
│   ├── AdminService.ts       # Admin business logic
│   ├── UserService.ts        # User CRUD operations
│   ├── TokenService.ts       # Token management
│   └── LoginAttemptService.ts # Security tracking
├── types/
│   └── admin.types.ts        # TypeScript interfaces
├── validators/
│   └── admin.validator.ts    # Request validation schemas
└── index.ts                 # Express app setup
```

## Database Tables Used

1. **users** - Base user table
2. **admin_roles** - Role definitions (auto-creates if missing)
3. **admin_users** - Admin user assignments
4. **authentication_tokens** - JWT token storage
5. **user_sessions** - Active session management
6. **login_attempts** - Security tracking
7. **account_locks** - Account lockout mechanism

## Security Features

✅ Password strength validation (8+ chars, uppercase, lowercase, number, special char)
✅ Bcrypt password hashing (12 rounds)
✅ JWT token with expiration
✅ Refresh token support
✅ Device fingerprinting
✅ Login attempt tracking
✅ Account lockout after 5 failed attempts
✅ Suspension check
✅ IP and User-Agent tracking
✅ Session management

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=virtualdoc
DB_USER=virtualdoc
DB_PASSWORD=virtualdoc123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

## Testing

```bash
# Signup
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin"
  }'

# Login
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!"
  }'
```

## Next Steps

- [ ] Add refresh token endpoint
- [ ] Add logout endpoint
- [ ] Add password reset functionality
- [ ] Add 2FA support
- [ ] Add rate limiting
- [ ] Add email verification

