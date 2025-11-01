# VirtualDoc Architecture Guide

## 🏗️ System Architecture

VirtualDoc is built as a **microservices architecture** with separate services for different domains.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         │    API Gateway (Nginx)              │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Auth Service │  │ User Service │  │Patient Service│  │
│  │   (Port 3001)│  │  (Port 3002) │  │  (Port 3003) │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │           │
│  ┌──────┴──────────────────┴──────────────────┴───────┐  │
│  │            Appointment Service (Port 3004)          │  │
│  └───────────────────────┬────────────────────────────┘  │
└───────────────────────────┼───────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ PostgreSQL  │  │    Redis    │  │  External   │
   │  Database    │  │    Cache    │  │   APIs      │
   └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 🔧 Service Architecture

### Auth Service Structure

```
auth-service/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection pool
│   ├── controllers/
│   │   └── AdminController.ts   # Request handlers
│   ├── services/
│   │   ├── UserService.ts       # User operations
│   │   ├── AdminService.ts      # Admin operations
│   │   ├── TokenService.ts      # Token management
│   │   └── LoginAttemptService.ts # Security tracking
│   ├── helpers/
│   │   ├── jwt.helper.ts        # JWT operations
│   │   ├── password.helper.ts  # Password hashing
│   │   └── device.helper.ts     # Device fingerprinting
│   ├── routes/
│   │   └── admin.routes.ts      # Route definitions
│   ├── types/
│   │   └── admin.types.ts       # TypeScript interfaces
│   ├── validators/
│   │   └── admin.validator.ts   # Request validation
│   └── index.ts                 # Express app setup
```

---

## 🔄 Request Flow

### Signup Flow

```
1. Client Request
   ↓
2. Route Handler (admin.routes.ts)
   ↓
3. Controller (AdminController.signup)
   ├─→ Validator (validateSignup)
   ├─→ UserService.emailExists
   ├─→ Password Helper (validatePasswordStrength)
   └─→ Transaction
       ├─→ UserService.createUser
       └─→ AdminService.createUniversalAdmin
   ↓
4. Response
```

### Login Flow

```
1. Client Request
   ↓
2. Route Handler
   ↓
3. Controller (AdminController.login)
   ├─→ Validator (validateLogin)
   ├─→ UserService.findByEmail
   ├─→ AdminService.isAccountLocked
   ├─→ AdminService.isSuspended
   ├─→ Password Helper (comparePassword)
   ├─→ LoginAttemptService.recordAttempt
   ├─→ TokenService.createTokenPair
   ├─→ Create user_session
   └─→ Update last_login
   ↓
4. Response (with tokens)
```

---

## 🗄️ Database Architecture

### Multi-Tenant Design

- **Tenant Isolation**: Each tenant has separate data via `tenant_id`
- **Universal Admin**: Uses `tenant_id = NULL`
- **Unique Constraint**: `UNIQUE(tenant_id, email)` allows same email across tenants

### Key Tables

1. **users** - Base user information
2. **admin_users** - Admin role assignments
3. **admin_roles** - Role definitions
4. **authentication_tokens** - JWT token storage
5. **user_sessions** - Active sessions
6. **login_attempts** - Security logging
7. **account_locks** - Account lockout

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Verify Credentials
   ├─→ Check account lock
   ├─→ Check suspension
   └─→ Verify password
   ↓
3. Generate Tokens
   ├─→ Access Token (1h, JWT)
   └─→ Refresh Token (7d, JWT)
   ↓
4. Store Tokens
   ├─→ Hash tokens (SHA-256)
   └─→ Store in authentication_tokens
   ↓
5. Create Session
   └─→ Store in user_sessions
```

### Password Security

- **Hashing**: Bcrypt with 12 rounds
- **Strength**: Enforced on signup (8+ chars, upper, lower, number, special)
- **Storage**: Never store plain passwords

### Token Security

- **Hashing**: SHA-256 for storage
- **JWT**: Signed with secret key
- **Expiration**: 1h access, 7d refresh
- **Revocation**: Can be revoked anytime

---

## 📦 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Validation**: Joi
- **Authentication**: JWT (jsonwebtoken)

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **API Gateway**: Nginx (future)

---

## 🔄 Data Flow

### Service Communication

```
Frontend → API Gateway → Auth Service
                              │
                              ├─→ PostgreSQL (Read/Write)
                              ├─→ Redis (Cache/Sessions)
                              └─→ Other Services (Future)
```

### Database Transaction Flow

```typescript
transaction(async (client) => {
  // All queries use same client
  await client.query('INSERT INTO users...');
  await client.query('INSERT INTO admin_users...');
  // If any fails, all rollback
});
```

---

## 🎯 Design Patterns

### 1. Service Layer Pattern
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic
- **Helpers**: Utility functions

### 2. Repository Pattern (Future)
- Abstract database operations
- Easier testing and maintenance

### 3. Dependency Injection
- Services injected into controllers
- Easy to mock for testing

---

## 📊 Scalability Considerations

### Horizontal Scaling
- Services run in Docker containers
- Can scale each service independently
- Stateless services (except sessions in Redis)

### Database Scaling
- Connection pooling (20 max connections per service)
- Indexes on frequently queried fields
- Read replicas (future)

### Caching Strategy
- Redis for sessions
- Cache frequently accessed data (future)
- Token validation caching (future)

---

## 🔒 Security Best Practices

1. **Environment Variables**: All secrets in `.env`
2. **Password Hashing**: Bcrypt with salt rounds
3. **Token Hashing**: SHA-256 before storage
4. **SQL Injection**: Parameterized queries
5. **XSS Protection**: Helmet.js middleware
6. **CORS**: Configured per environment
7. **Rate Limiting**: Account lockout mechanism
8. **Audit Logging**: All security events logged

---

## 🧪 Testing Strategy

### Unit Tests (Future)
- Service layer logic
- Helper functions
- Validators

### Integration Tests (Future)
- API endpoints
- Database operations
- Token generation/verification

### E2E Tests (Future)
- Complete user flows
- Cross-service interactions

---

## 📈 Monitoring & Logging

### Current
- Console logging (development)
- Database query logging

### Future
- Structured logging (Winston)
- Error tracking (Sentry)
- Performance monitoring
- Health checks

---

## 🚀 Deployment Architecture (Future)

```
┌────────────────────────────────────────┐
│         Load Balancer (Nginx)          │
└─────────────────┬──────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐
│ Auth 1  │  │ Auth 2 │  │ Auth 3 │
└────────┘  └────────┘  └────────┘
    │             │             │
    └─────────────┼─────────────┘
                  ▼
         ┌────────────────┐
         │  PostgreSQL    │
         │  (Primary +    │
         │   Replicas)    │
         └────────────────┘
```

---

This architecture provides:
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Testability
- ✅ Flexibility

