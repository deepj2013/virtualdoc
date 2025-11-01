# VirtualDoc Testing Guide

## 🧪 Testing Overview

This guide covers testing procedures for the VirtualDoc platform, including API testing, database testing, and integration testing.

---

## 🚀 Quick Testing

### Health Check

```bash
curl http://localhost:3001/health

# Expected Response:
# {"status":"ok","service":"auth-service","timestamp":"..."}
```

---

## 📝 API Testing

### 1. Universal Admin Signup

```bash
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin",
    "phone": "+1234567890"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Universal Admin account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@test.com",
      "firstName": "Test",
      "lastName": "Admin",
      "adminRoleCode": "universal_admin"
    }
  }
}
```

---

### 2. Universal Admin Login

```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@test.com",
      "firstName": "Test",
      "lastName": "Admin",
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

---

## 🧪 Test Scenarios

### Test 1: Signup Validation

**Test Invalid Email:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

**Expected:** 400 Bad Request with validation errors

---

**Test Weak Password:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "weak",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

**Expected:** 400 Bad Request - Password strength error

---

**Test Duplicate Email:**
```bash
# Run signup twice with same email
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

**Expected:** 409 Conflict - Email already registered

---

### Test 2: Login Validation

**Test Invalid Credentials:**
```bash
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "WrongPassword"
  }'
```

**Expected:** 401 Unauthorized - Invalid email or password

---

**Test Account Lockout:**
```bash
# Try wrong password 5 times
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@test.com",
      "password": "WrongPassword"
    }'
done

# 6th attempt
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!"
  }'
```

**Expected:** 403 Forbidden - Account is locked

---

## 📦 Postman Testing

### Import Collection

1. Open Postman
2. Click "Import"
3. Select `docs/postman/VirtualDoc_API_Collection.json`
4. Collection will be imported with all endpoints

### Environment Variables

Collection includes variables:
- `base_url`: `http://localhost:3001`
- `access_token`: Auto-populated after login
- `refresh_token`: Auto-populated after login

### Running Tests

1. **Run Health Check** - Verify service is running
2. **Run Signup** - Create test admin account
3. **Run Login** - Authenticate and get tokens
4. **Use Tokens** - Tokens auto-saved for authenticated requests

---

## 🗄️ Database Testing

### Verify User Creation

```sql
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.role,
  au.admin_role_code,
  au.is_active
FROM users u
LEFT JOIN admin_users au ON u.id = au.user_id
WHERE u.email = 'admin@test.com';
```

### Verify Token Creation

```sql
SELECT 
  id,
  token_type,
  expires_at,
  is_active,
  issued_at
FROM authentication_tokens
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@test.com')
ORDER BY issued_at DESC
LIMIT 5;
```

### Verify Session Creation

```sql
SELECT 
  id,
  device_type,
  ip_address,
  logged_in_at,
  expires_at,
  is_active,
  is_current
FROM user_sessions
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@test.com')
ORDER BY logged_in_at DESC;
```

### Verify Login Attempts

```sql
SELECT 
  email,
  attempt_type,
  success,
  failure_reason,
  attempted_at
FROM login_attempts
WHERE email = 'admin@test.com'
ORDER BY attempted_at DESC
LIMIT 10;
```

---

## 🔒 Security Testing

### Password Strength Test

Test various password scenarios:

```bash
# Too short
{"password": "Short1!"}

# No uppercase
{"password": "lowercase123!"}

# No lowercase
{"password": "UPPERCASE123!"}

# No number
{"password": "NoNumbers!"}

# No special char
{"password": "NoSpecial123"}
```

All should fail validation.

---

### Token Validation Test

```bash
# Extract token from login response
TOKEN="your_access_token_here"

# Test token (when endpoint implemented)
curl -X GET http://localhost:3001/api/admin/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧹 Cleanup Testing

### Clean Test Data

```sql
-- Delete test user and all related data
DELETE FROM user_sessions 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

DELETE FROM authentication_tokens 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

DELETE FROM admin_users 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@test.com');

DELETE FROM users 
WHERE email = 'admin@test.com';
```

---

## 📊 Performance Testing

### Load Testing (Future)

```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 \
  -p login.json \
  -T application/json \
  http://localhost:3001/api/admin/auth/login
```

### Response Time Testing

```bash
# Measure response time
time curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!"
  }'
```

---

## ✅ Test Checklist

- [ ] Health check endpoint responds
- [ ] Signup with valid data succeeds
- [ ] Signup validation errors work
- [ ] Duplicate email signup fails
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials fails
- [ ] Account lockout after 5 failed attempts
- [ ] Tokens are generated correctly
- [ ] Tokens are stored in database
- [ ] Sessions are created
- [ ] Login attempts are logged
- [ ] Password strength validation works

---

## 🐛 Debugging Tests

### View Service Logs

```bash
docker-compose logs -f auth-service
```

### Check Database

```bash
docker-compose exec postgres psql -U virtualdoc -d virtualdoc
```

### Check Redis

```bash
docker-compose exec redis redis-cli
```

---

## 📚 Related Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Postman Collection](./postman/VirtualDoc_API_Collection.json)

