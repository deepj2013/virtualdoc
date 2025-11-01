# Database Schema - Authentication & Authorization Module

## 🔐 Overview
Comprehensive authentication and authorization system for SaaS portal management with universal admin, sub-admin, and tenant admin roles. Includes token management, session handling, and role-based access control.

---

## 23. ENHANCED AUTHENTICATION & AUTHORIZATION MODULE

### admin_roles
Admin role definitions and hierarchy
```sql
CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) UNIQUE NOT NULL, -- 'universal_admin', 'sub_admin', 'tenant_admin', 'super_admin'
    role_name VARCHAR(100) NOT NULL,
    role_description TEXT,
    hierarchy_level INTEGER NOT NULL, -- 1 = highest (universal), 2 = sub, 3 = tenant, etc.
    permissions JSONB NOT NULL, -- Array of permission codes
    can_manage_users BOOLEAN DEFAULT false,
    can_manage_tenants BOOLEAN DEFAULT false,
    can_manage_admins BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_manage_billing BOOLEAN DEFAULT false,
    can_configure_system BOOLEAN DEFAULT false,
    scope VARCHAR(50) DEFAULT 'global', -- 'global', 'tenant', 'department'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_users
Admin users (Universal Admin, Sub-Admin, Tenant Admin)
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL, -- NULL for universal admin
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    admin_role_code VARCHAR(50) NOT NULL, -- 'universal_admin', 'sub_admin', 'tenant_admin'
    assigned_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL, -- For tenant admins
    assigned_departments UUID[], -- Array of department IDs (for sub-admins)
    is_active BOOLEAN DEFAULT true,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    suspended_by UUID REFERENCES users(id),
    suspended_at TIMESTAMP,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    requires_password_change BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[], -- Array of backup codes
    assigned_by UUID REFERENCES users(id), -- Who assigned this admin role
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);
```

### authentication_tokens
Token storage for authentication (JWT, refresh tokens, API keys)
```sql
CREATE TABLE authentication_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- 'access_token', 'refresh_token', 'api_key', 'password_reset', 'email_verification', '2fa_token'
    token_hash VARCHAR(255) NOT NULL, -- Hashed token value
    token_value TEXT, -- Encrypted token (for password reset, email verification)
    jti VARCHAR(255) UNIQUE, -- JWT ID (for JWT tokens)
    refresh_token_id UUID REFERENCES authentication_tokens(id) ON DELETE SET NULL, -- Link refresh to access token
    device_id VARCHAR(255), -- Device identifier
    device_info TEXT, -- Device information (browser, OS, etc.)
    ip_address VARCHAR(45),
    user_agent TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP, -- If token is revoked before expiration
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB, -- Additional token metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_sessions
Active user sessions management
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL, -- Session identifier
    access_token_id UUID REFERENCES authentication_tokens(id) ON DELETE SET NULL,
    refresh_token_id UUID REFERENCES authentication_tokens(id) ON DELETE SET NULL,
    device_id VARCHAR(255),
    device_name VARCHAR(255), -- User-friendly device name
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet', 'api'
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB, -- Geo-location data if available
    login_method VARCHAR(50), -- 'password', 'oauth', 'sso', 'api_key', '2fa'
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    logged_out_at TIMESTAMP,
    logout_reason VARCHAR(100), -- 'user', 'timeout', 'security', 'admin'
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false, -- Mark current session
    forced_logout BOOLEAN DEFAULT false, -- Admin forced logout
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### password_reset_tokens
Password reset token management
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_value VARCHAR(255) NOT NULL, -- Plain token (encrypted in storage)
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- Typically 1 hour
    used_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### email_verification_tokens
Email verification token management
```sql
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_value VARCHAR(255) NOT NULL,
    verification_type VARCHAR(50) DEFAULT 'email', -- 'email', 'phone', '2fa'
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL, -- Typically 24 hours
    verified_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    is_expired BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### api_keys
API key management for programmatic access
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL, -- User-friendly name
    key_hash VARCHAR(255) UNIQUE NOT NULL, -- Hashed API key
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for display (e.g., "vd_live_...")
    key_scope VARCHAR(50) DEFAULT 'read_write', -- 'read', 'write', 'read_write', 'admin'
    permissions JSONB, -- Specific permissions
    ip_whitelist TEXT[], -- Allowed IP addresses (empty = all)
    rate_limit_per_minute INTEGER DEFAULT 100,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP, -- NULL = never expires
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### login_attempts
Track login attempts for security
```sql
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if user not found
    email VARCHAR(255), -- Email/username attempted
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempt_type VARCHAR(50) DEFAULT 'password', -- 'password', 'oauth', 'api_key', '2fa'
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(255), -- 'invalid_credentials', 'account_locked', '2fa_required', etc.
    device_fingerprint VARCHAR(255), -- Device fingerprint for security
    location JSONB, -- Geo-location
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### account_locks
Account lockout management
```sql
CREATE TABLE account_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    lock_type VARCHAR(50) NOT NULL, -- 'failed_attempts', 'admin_lock', 'suspicious_activity', 'security_breach'
    lock_reason TEXT,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP, -- NULL = permanent until unlocked
    unlocked_at TIMESTAMP,
    unlocked_by UUID REFERENCES users(id),
    unlock_reason TEXT,
    failed_attempts INTEGER DEFAULT 0,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_permissions
Granular permissions for admin roles
```sql
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    permission_category VARCHAR(100) NOT NULL, -- 'user_management', 'tenant_management', 'billing', 'analytics', 'system_config'
    description TEXT,
    applies_to VARCHAR(50) DEFAULT 'all', -- 'universal_admin', 'sub_admin', 'tenant_admin', 'all'
    is_critical BOOLEAN DEFAULT false, -- Critical permissions require additional approval
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admin_role_permissions
Mapping of permissions to admin roles
```sql
CREATE TABLE admin_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES admin_permissions(id) ON DELETE CASCADE NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_execute BOOLEAN DEFAULT false,
    conditions JSONB, -- Additional conditions/restrictions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_role_id, permission_id)
);
```

### admin_activity_logs
Audit log for admin actions
```sql
CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'view', 'export', 'configure'
    resource_type VARCHAR(100) NOT NULL, -- 'user', 'tenant', 'admin', 'billing', 'config'
    resource_id UUID,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB,
    changes_made JSONB, -- Before/after values for changes
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'critical', 'security'
    status VARCHAR(50) DEFAULT 'success', -- 'success', 'failed', 'partial'
    error_message TEXT,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## INDEXES FOR PERFORMANCE

```sql
-- Admin roles and users
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_tenant_id ON admin_users(tenant_id);
CREATE INDEX idx_admin_users_role_code ON admin_users(admin_role_code);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

-- Authentication tokens
CREATE INDEX idx_auth_tokens_user_id ON authentication_tokens(user_id);
CREATE INDEX idx_auth_tokens_token_hash ON authentication_tokens(token_hash);
CREATE INDEX idx_auth_tokens_jti ON authentication_tokens(jti) WHERE jti IS NOT NULL;
CREATE INDEX idx_auth_tokens_expires_at ON authentication_tokens(expires_at);
CREATE INDEX idx_auth_tokens_active ON authentication_tokens(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_auth_tokens_type ON authentication_tokens(token_type);
CREATE INDEX idx_auth_tokens_user_type ON authentication_tokens(user_id, token_type);

-- User sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_user_sessions_current ON user_sessions(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Password reset tokens
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_active ON password_reset_tokens(is_used, is_revoked, expires_at) WHERE is_used = false AND is_revoked = false;

-- Email verification tokens
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_email ON email_verification_tokens(email);
CREATE INDEX idx_email_verification_expires_at ON email_verification_tokens(expires_at);

-- API keys
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

-- Login attempts
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_failed ON login_attempts(user_id, success, attempted_at) WHERE success = false;

-- Account locks
CREATE INDEX idx_account_locks_user_id ON account_locks(user_id);
CREATE INDEX idx_account_locks_active ON account_locks(user_id, locked_until) WHERE locked_until IS NULL OR locked_until > CURRENT_TIMESTAMP;
CREATE INDEX idx_account_locks_type ON account_locks(lock_type);

-- Admin activity logs
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_user_id ON admin_activity_logs(user_id);
CREATE INDEX idx_admin_activity_resource ON admin_activity_logs(resource_type, resource_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_severity ON admin_activity_logs(severity) WHERE severity IN ('critical', 'security');
```

---

## FEATURES SUPPORTED

✅ Universal Admin role (highest level, manages entire platform)
✅ Sub-Admin role (manages specific tenants/departments)
✅ Tenant Admin role (manages their own tenant)
✅ JWT access tokens and refresh tokens
✅ Token expiration and automatic cleanup
✅ Session management with device tracking
✅ Password reset token with expiration
✅ Email verification tokens
✅ API key management for programmatic access
✅ Login attempt tracking and security
✅ Account lockout after failed attempts
✅ Admin activity audit logging
✅ Granular permission system
✅ Device fingerprinting and location tracking
✅ Multi-device session management
✅ Token revocation capability
✅ Security breach detection

---

## ROLE HIERARCHY

### Universal Admin (Level 1)
- Full access to entire platform
- Can manage all tenants, users, and admins
- System configuration access
- Global analytics and reporting
- Billing and subscription management

### Sub-Admin (Level 2)
- Manages assigned tenants/departments
- Can manage users within scope
- Access to tenant-specific analytics
- Limited system configuration
- No billing access

### Tenant Admin (Level 3)
- Manages their own tenant only
- Can manage users within tenant
- Tenant-specific configuration
- Limited analytics (own tenant only)
- No access to other tenants

---

## TOKEN TYPES EXPLAINED

### Access Token (JWT)
- Short-lived (15-60 minutes)
- Contains user info and permissions
- Used for API authentication
- Stored with expiration

### Refresh Token
- Long-lived (7-30 days)
- Used to get new access tokens
- Can be revoked
- Linked to device/session

### API Key
- Long-lived or permanent
- For programmatic access
- Has scope and rate limits
- Can be revoked

### Password Reset Token
- Short-lived (1 hour)
- Single use
- Email verification required
- Auto-expires

### Email Verification Token
- Medium-lived (24 hours)
- Single use
- For account verification
- Auto-expires

---

## SECURITY FEATURES

✅ Token hashing (never store plain tokens)
✅ Automatic token expiration
✅ Token revocation capability
✅ Failed login attempt tracking
✅ Account lockout mechanism
✅ Device tracking and fingerprinting
✅ IP address logging
✅ Geo-location tracking
✅ Session management
✅ Admin activity audit trail
✅ Suspicious activity detection

---

## USAGE EXAMPLES

### Creating Universal Admin
```sql
-- 1. Create admin role
INSERT INTO admin_roles (
    role_code, role_name, hierarchy_level,
    can_manage_users, can_manage_tenants, can_manage_admins,
    can_access_analytics, can_manage_billing, can_configure_system
) VALUES (
    'universal_admin', 'Universal Admin', 1,
    true, true, true, true, true, true
);

-- 2. Assign to user
INSERT INTO admin_users (
    user_id, admin_role_code, is_active
) VALUES (
    'user-uuid', 'universal_admin', true
);
```

### Creating Access Token
```sql
INSERT INTO authentication_tokens (
    user_id, token_type, token_hash, jti,
    device_id, ip_address, expires_at
) VALUES (
    'user-uuid', 'access_token',
    'hashed-jwt-token', 'jti-uuid',
    'device-id', '192.168.1.1',
    CURRENT_TIMESTAMP + INTERVAL '1 hour'
);
```

### Creating Session
```sql
INSERT INTO user_sessions (
    user_id, session_token, access_token_id,
    device_id, device_name, device_type,
    ip_address, expires_at
) VALUES (
    'user-uuid', 'session-token-uuid',
    'access-token-id', 'device-id',
    'Chrome on Mac', 'desktop',
    '192.168.1.1',
    CURRENT_TIMESTAMP + INTERVAL '7 days'
);
```

---

This comprehensive authentication module supports all SaaS portal management requirements with proper security, token management, and role-based access control.
