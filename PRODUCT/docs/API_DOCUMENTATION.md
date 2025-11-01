# VirtualDoc API Documentation

This document provides comprehensive information about the VirtualDoc API documentation system using Swagger/OpenAPI 3.0.

## Overview

VirtualDoc uses Swagger (OpenAPI 3.0) for API documentation across all microservices. Each service has its own categorized documentation, and there's a centralized API Gateway that provides access to all service documentation.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 3000)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Centralized Documentation                 │   │
│  │         http://localhost:3000/api-docs             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
    ┌───────────▼───┐  ┌────────▼────┐  ┌──────▼──────┐
    │ Auth Service  │  │Discovery Svc│  │Patient Svc  │
    │  Port 3001    │  │ Port 3002   │  │ Port 3003   │
    │ /api-docs     │  │ /api-docs   │  │ /api-docs   │
    └───────────────┘  └─────────────┘  └─────────────┘
                                │
                        ┌───────▼───────┐
                        │ User Service  │
                        │  Port 3004    │
                        │ /api-docs     │
                        └───────────────┘
```

## Service Documentation

### 1. Authentication Service (Port 3001)
**URL:** `http://localhost:3001/api-docs`

**Categories:**
- **Authentication** - User login, registration, logout
- **Authorization** - Access control and permissions
- **Password Management** - Password reset and change operations
- **User Profile** - Current user profile operations

**Key Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request

### 2. Discovery Service (Port 3002)
**URL:** `http://localhost:3002/api-docs`

**Categories:**
- **Doctors** - Doctor profiles, search, and management
- **Appointments** - Appointment booking and management
- **Reviews** - Doctor reviews and ratings
- **Search** - Advanced search and filtering capabilities
- **Insurance** - Insurance provider management
- **Availability** - Doctor availability and scheduling

**Key Endpoints:**
- `GET /api/doctors` - Get all doctors with filters
- `GET /api/doctors/{id}` - Get doctor by ID
- `GET /api/doctors/{id}/availability` - Get doctor availability
- `GET /api/doctors/{id}/reviews` - Get doctor reviews
- `POST /api/appointments` - Book appointment

### 3. Patient Service (Port 3003)
**URL:** `http://localhost:3003/api-docs`

**Categories:**
- **Patients** - Patient profile and basic information management
- **Medical Records** - Medical history and health records management
- **Demographics** - Patient demographic information and personal details
- **Insurance** - Insurance information and coverage management
- **Emergency Contacts** - Emergency contact information management
- **Documents** - Medical documents and file management
- **Search** - Patient search and filtering capabilities

**Key Endpoints:**
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/{id}` - Get patient by ID
- `GET /api/patients/{id}/medical-history` - Get medical history
- `POST /api/patients/{id}/documents` - Upload medical documents

### 4. User Service (Port 3004)
**URL:** `http://localhost:3004/api-docs`

**Categories:**
- **Users** - User profile and account management
- **Profiles** - User profile information and preferences
- **Settings** - User account settings and preferences
- **Notifications** - User notification preferences and settings
- **Search** - User search and filtering capabilities

**Key Endpoints:**
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user profile
- `GET /api/profiles/{id}` - Get user profile details

## Centralized API Gateway

**URL:** `http://localhost:3000/api-docs`

The API Gateway provides:
- Centralized access to all service documentation
- Service health monitoring
- API overview and service discovery
- Redirects to individual service documentation

### Gateway Endpoints:
- `GET /api-docs` - Centralized documentation
- `GET /health` - Health check for all services
- `GET /api` - API overview and service information
- `GET /api/{service}/docs` - Redirect to specific service docs

## Features

### 1. Categorized Documentation
Each service has its API endpoints organized into logical categories (tags) for better navigation and understanding.

### 2. Interactive Testing
All endpoints support "Try it out" functionality, allowing developers to test APIs directly from the documentation.

### 3. Authentication Support
- Bearer Token authentication for protected endpoints
- API Key authentication for service-to-service communication
- Clear indication of which endpoints require authentication

### 4. Comprehensive Schemas
- Detailed request/response schemas
- Validation rules and constraints
- Example data for all endpoints
- Common error response schemas

### 5. Real-time Documentation
- Auto-generated from code annotations
- Always up-to-date with actual implementation
- Version-controlled documentation

## Usage

### 1. Accessing Documentation
```bash
# Centralized documentation
http://localhost:3000/api-docs

# Individual service documentation
http://localhost:3001/api-docs  # Auth Service
http://localhost:3002/api-docs  # Discovery Service
http://localhost:3003/api-docs  # Patient Service
http://localhost:3004/api-docs  # User Service
```

### 2. Testing APIs
1. Navigate to the desired endpoint in the documentation
2. Click "Try it out"
3. Fill in required parameters
4. Click "Execute" to test the API
5. View the response and status code

### 3. Authentication
For protected endpoints:
1. Click the "Authorize" button
2. Enter your Bearer token
3. Click "Authorize"
4. Now you can test protected endpoints

## Development

### Adding New Endpoints
To add Swagger documentation for new endpoints:

1. Add JSDoc comments above your route handler:
```typescript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Endpoint description
 *     tags: [Category Name]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.get('/endpoint', handler);
```

2. The documentation will be automatically generated and available at the service's `/api-docs` endpoint.

### Common Response Schemas
Use these common response references in your documentation:
- `#/components/responses/UnauthorizedError`
- `#/components/responses/ValidationError`
- `#/components/responses/NotFoundError`
- `#/components/responses/InternalServerError`

### Common Schemas
Use these common schema references:
- `#/components/schemas/Pagination`
- `#/components/schemas/Error`
- `#/components/schemas/Success`

## Configuration

### Service Configuration
Each service has its own Swagger configuration in `src/config/swagger.ts`:

```typescript
const serviceConfig: SwaggerServiceConfig = {
  serviceName: 'Service Name',
  serviceDescription: 'Service description',
  version: '1.0.0',
  port: 3001,
  basePath: '/api',
  tags: [
    {
      name: 'Category Name',
      description: 'Category description'
    }
  ]
};
```

### Shared Configuration
Common Swagger configuration is shared across services in `backend/common/swagger-config/swaggerConfig.ts`.

## Best Practices

1. **Consistent Naming**: Use consistent naming conventions for tags, endpoints, and schemas
2. **Detailed Descriptions**: Provide clear, detailed descriptions for all endpoints and parameters
3. **Example Data**: Include realistic example data for all request/response schemas
4. **Error Handling**: Document all possible error responses with appropriate status codes
5. **Authentication**: Clearly indicate which endpoints require authentication
6. **Validation**: Document all validation rules and constraints
7. **Versioning**: Use semantic versioning for API versions

## Troubleshooting

### Common Issues

1. **Documentation not updating**: Restart the service after adding new annotations
2. **Missing endpoints**: Ensure JSDoc comments are properly formatted
3. **Authentication errors**: Check that the correct authentication method is configured
4. **Schema errors**: Validate that schema references are correct

### Debug Mode
Enable debug mode by setting `NODE_ENV=development` to see detailed error messages.

## Support

For issues with API documentation:
1. Check the service logs for errors
2. Verify JSDoc comment formatting
3. Ensure all dependencies are installed
4. Contact the development team

## Future Enhancements

- [ ] API versioning support
- [ ] Automated testing integration
- [ ] Performance metrics in documentation
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Export documentation to PDF/HTML
- [ ] Integration with CI/CD pipeline
