# VirtualDoc Database Guide

## 📊 Database Overview

VirtualDoc uses **PostgreSQL 15** as the primary database with comprehensive schema supporting multi-tenant SaaS architecture.

---

## 🗄️ Database Structure

### Connection Details

**Development:**
- Host: `localhost`
- Port: `5432`
- Database: `virtualdoc`
- User: `virtualdoc`
- Password: `virtualdoc123`

**Connection String:**
```
postgresql://virtualdoc:virtualdoc123@localhost:5432/virtualdoc
```

---

## 📋 Schema Modules

### 1. Multi-Tenant & Organization
- `tenants` - SaaS tenants/organizations
- `tenant_configurations` - Tenant-specific settings
- `departments` - Hospital/clinic departments

### 2. User & Authentication
- `users` - Base user table
- `admin_roles` - Admin role definitions
- `admin_users` - Admin user assignments
- `user_roles` - Role assignments
- `permissions` - System permissions
- `role_permissions` - Permission mappings

### 3. Authentication & Tokens
- `authentication_tokens` - JWT token storage
- `user_sessions` - Active sessions
- `password_reset_tokens` - Password reset
- `email_verification_tokens` - Email verification
- `login_attempts` - Security tracking
- `account_locks` - Account lockout

### 4. Patient Management
- `patients` - Patient information
- `patient_family` - Family relationships
- `patient_allergies` - Allergy records
- `patient_medications` - Current medications
- `patient_vital_signs` - Vital signs tracking

### 5. Medical Records
- `medical_records` - Medical visit records
- `prescriptions` - Prescription records
- `reports` - Medical reports
- `lab_results` - Laboratory results

---

## 🔑 Key Constraints

### Unique Constraints

```sql
-- Users: Same email can exist in different tenants
UNIQUE(tenant_id, email)

-- Admin Users: One admin role per tenant per user
UNIQUE(user_id, tenant_id)

-- Authentication Tokens
UNIQUE(jti)  -- JWT ID
UNIQUE(token_hash)
```

### Foreign Keys

- `users.tenant_id` → `tenants.id`
- `admin_users.user_id` → `users.id`
- `admin_users.admin_role_id` → `admin_roles.id`
- `authentication_tokens.user_id` → `users.id`
- `user_sessions.user_id` → `users.id`

---

## 🔍 Common Queries

### Get Universal Admin

```sql
SELECT 
  u.*,
  au.*
FROM users u
INNER JOIN admin_users au ON u.id = au.user_id
WHERE au.admin_role_code = 'universal_admin'
  AND u.email = 'admin@example.com';
```

### Get Active Sessions

```sql
SELECT 
  us.*,
  u.email,
  u.first_name,
  u.last_name
FROM user_sessions us
INNER JOIN users u ON us.user_id = u.id
WHERE us.is_active = true
  AND us.expires_at > CURRENT_TIMESTAMP
  AND us.user_id = $1;
```

### Get User Tokens

```sql
SELECT *
FROM authentication_tokens
WHERE user_id = $1
  AND is_active = true
  AND expires_at > CURRENT_TIMESTAMP
  AND revoked_at IS NULL
ORDER BY issued_at DESC;
```

### Check Failed Login Attempts

```sql
SELECT COUNT(*) as failed_count
FROM login_attempts
WHERE email = $1
  AND success = false
  AND attempted_at > NOW() - INTERVAL '15 minutes';
```

---

## 🔐 Security Considerations

### Password Storage
- Never store plain passwords
- Always use `password_hash` column
- Use Bcrypt with 12 salt rounds

### Token Storage
- Store hashed tokens only
- Use `token_hash` for lookups
- Never log full tokens

### Query Safety
- Always use parameterized queries
- Never concatenate user input into SQL
- Use transactions for multi-step operations

---

## 📈 Performance Optimization

### Indexes

Key indexes are already created:

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Token lookups
CREATE INDEX idx_auth_tokens_user_id ON authentication_tokens(user_id);
CREATE INDEX idx_auth_tokens_token_hash ON authentication_tokens(token_hash);
CREATE INDEX idx_auth_tokens_expires_at ON authentication_tokens(expires_at);

-- Session lookups
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
```

### Query Optimization Tips

1. **Use Indexes**: Always query on indexed columns
2. **Limit Results**: Use `LIMIT` for pagination
3. **Select Specific Columns**: Avoid `SELECT *`
4. **Use EXPLAIN**: Analyze query performance

---

## 🧹 Maintenance Queries

### Clean Expired Tokens

```sql
UPDATE authentication_tokens
SET is_active = false, revoked_at = CURRENT_TIMESTAMP
WHERE expires_at < CURRENT_TIMESTAMP
  AND is_active = true;
```

### Clean Expired Sessions

```sql
UPDATE user_sessions
SET is_active = false, logged_out_at = CURRENT_TIMESTAMP
WHERE expires_at < CURRENT_TIMESTAMP
  AND is_active = true;
```

### Archive Old Login Attempts

```sql
DELETE FROM login_attempts
WHERE attempted_at < NOW() - INTERVAL '90 days';
```

---

## 🔄 Multi-Tenant Queries

### Tenant Isolation

Always filter by `tenant_id`:

```sql
-- ✅ Good: Tenant-scoped query
SELECT * FROM users
WHERE tenant_id = $1 AND email = $2;

-- ❌ Bad: No tenant filter (for non-universal admin)
SELECT * FROM users WHERE email = $2;
```

### Universal Admin Queries

Universal admins use `tenant_id IS NULL`:

```sql
SELECT * FROM users
WHERE tenant_id IS NULL
  AND email = $1;
```

---

## 🛠️ Database Tools

### Using psql

```bash
# Connect
psql -h localhost -U virtualdoc -d virtualdoc

# Run SQL file
psql -h localhost -U virtualdoc -d virtualdoc -f script.sql

# Execute query
psql -h localhost -U virtualdoc -d virtualdoc -c "SELECT COUNT(*) FROM users;"
```

### Using Docker

```bash
# Connect via Docker
docker-compose exec postgres psql -U virtualdoc -d virtualdoc

# Run SQL file
docker-compose exec -T postgres psql -U virtualdoc -d virtualdoc < script.sql
```

---

## 📊 Database Schema Files

- **Complete Schema**: `database/schema/complete_schema.sql`
- **ER Diagram**: `database/schema/virtualdoc_database_schema.drawio.xml`
- **Authentication Schema**: `database/schema/DATABASE_SCHEMA_AUTHENTICATION.md`

---

## 🚨 Important Notes

1. **Never** drop tables in production
2. **Always** backup before migrations
3. **Use** transactions for multi-step operations
4. **Test** queries in development first
5. **Monitor** query performance regularly

---

## 📚 Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)

