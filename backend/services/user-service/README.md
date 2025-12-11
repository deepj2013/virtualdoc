# User Service

User Management Service for VirtualDoc platform. This service handles user CRUD operations, role management, and permissions.

## Architecture

The service follows the standard microservices architecture pattern used across VirtualDoc services:

```
user-service/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection pool
│   ├── controllers/
│   │   └── UserController.ts    # Request handlers
│   ├── services/
│   │   ├── UserService.ts       # User operations
│   │   ├── RoleService.ts       # Role operations
│   │   └── PermissionService.ts # Permission operations
│   ├── helpers/
│   │   └── password.helper.ts   # Password hashing utilities
│   ├── routes/
│   │   ├── user.routes.ts       # User routes
│   │   ├── permission.routes.ts # Permission routes
│   │   └── role.routes.ts       # Role routes
│   ├── types/
│   │   └── user.types.ts        # TypeScript interfaces
│   ├── validators/
│   │   └── user.validator.ts    # Request validation
│   ├── utils/
│   │   └── logger.ts            # Secure logging (HIPAA compliant)
│   └── index.ts                 # Express app setup
```

## Features

### User Management
- Create, read, update, delete users
- Multi-tenant support
- Soft delete (deactivation)
- User profile management
- Email and phone verification tracking

### Role Management
- Assign roles to users
- Multi-role support per user
- Department-based role assignments
- Role activation/deactivation

### Permission Management
- Create and manage permissions
- Assign permissions to roles
- Module-based permission organization
- Fine-grained access control (read, write, delete, manage)

## API Endpoints

### Users

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "doctor",
  "tenantId": "uuid",
  "departmentId": "uuid" // optional
}
```

#### Get User
```http
GET /api/users/:id?tenantId=uuid
```

#### Update User
```http
PUT /api/users/:id?tenantId=uuid
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### Delete User (Soft Delete)
```http
DELETE /api/users/:id?tenantId=uuid
```

#### List Users
```http
GET /api/users?tenantId=uuid&role=doctor&departmentId=uuid&isActive=true&page=1&limit=20
```

### User Roles

#### Create User Role
```http
POST /api/users/:id/roles
Content-Type: application/json

{
  "role": "doctor",
  "tenantId": "uuid",
  "departmentId": "uuid", // optional
  "assignedBy": "uuid"
}
```

#### Get User Roles
```http
GET /api/users/:id/roles?tenantId=uuid
```

#### Remove User Role
```http
DELETE /api/users/:id/roles/:roleId?tenantId=uuid&role=doctor&departmentId=uuid
```

### Permissions

#### Create Permission
```http
POST /api/permissions
Content-Type: application/json

{
  "name": "View Patient Records",
  "code": "view_patient_records",
  "module": "patient_management",
  "description": "Permission to view patient medical records"
}
```

#### Get All Permissions
```http
GET /api/permissions?module=patient_management
```

### Role Permissions

#### Assign Permission to Role
```http
POST /api/roles/:role/permissions
Content-Type: application/json

{
  "permissionId": "uuid",
  "canRead": true,
  "canWrite": true,
  "canDelete": false,
  "canManage": false
}
```

#### Get Role Permissions
```http
GET /api/roles/:role/permissions
```

## Database Schema

The service uses the following database tables:

### Core Tables
- `users` - User accounts and profiles
- `user_roles` - User role assignments
- `permissions` - System permissions
- `role_permissions` - Role-permission mappings

### Multi-Tenant Support
- All user operations support tenant isolation via `tenant_id`
- Universal admins have `tenant_id = NULL`
- Email uniqueness is enforced per tenant: `UNIQUE(tenant_id, email)`

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/virtualdoc
# OR
DB_HOST=localhost
DB_PORT=5432
DB_NAME=virtualdoc
DB_USER=virtualdoc
DB_PASSWORD=virtualdoc123

# Service
PORT=3002
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Running the Service

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm run build
npm start
```

### Docker
```bash
docker build -t user-service .
docker run -p 3002:3002 user-service
```

## Security Features

### HIPAA Compliance
- Secure logging (no PHI in logs)
- Password hashing with bcrypt (12 rounds)
- SQL injection protection (parameterized queries)
- Input validation with Joi
- XSS protection with Helmet.js
- CORS configuration

### Audit Logging
- All user operations are logged
- Security events are tracked
- No sensitive data in logs

## Error Handling

All errors are handled consistently:
- Validation errors: 400 Bad Request
- Not found errors: 404 Not Found
- Conflict errors: 409 Conflict
- Server errors: 500 Internal Server Error

Error responses include:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error details"] // optional
}
```

## Testing

```bash
npm test
```

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **joi** - Input validation
- **helmet** - Security middleware
- **cors** - CORS support
- **winston** - Logging (future)

## License

Proprietary - VirtualDoc Platform

