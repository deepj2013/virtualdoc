# VirtualDoc Developer Documentation

## 📚 Documentation Index

Welcome to the VirtualDoc platform developer documentation. This folder contains all the resources you need to understand, develop, and test the platform.

### 📂 Contents

1. **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
2. **[Postman Collection](./postman/VirtualDoc_API_Collection.json)** - Ready-to-use API collection
3. **[Setup Guide](./SETUP_GUIDE.md)** - Development environment setup
4. **[Architecture Guide](./ARCHITECTURE.md)** - System architecture and design patterns
5. **[Database Guide](./DATABASE_GUIDE.md)** - Database schema and queries
6. **[Testing Guide](./TESTING_GUIDE.md)** - Testing procedures and examples

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Clone repository
git clone <repository-url>
cd virtualDoc

# Install dependencies
npm install

# Start services
docker-compose up -d

# Or use npm scripts
npm run dev
```

### Quick Test

```bash
# Check health
curl http://localhost:3001/health

# Signup Universal Admin
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "Admin"
  }'
```

---

## 📖 Project Structure

```
virtualDoc/
├── backend/
│   └── services/
│       ├── auth-service/      # Authentication & Authorization
│       ├── user-service/      # User Management
│       ├── patient-service/   # Patient Management
│       └── appointment-service/ # Appointment Scheduling
├── frontend/
│   └── apps/
│       └── web-app/           # React Web Application
├── database/
│   └── schema/                # Database schemas and migrations
├── docs/                       # Documentation (this folder)
└── config/                     # Configuration files
```

---

## 🔧 Services Overview

### Auth Service (Port 3001)
- Universal Admin signup/login
- JWT token generation
- Session management
- Account security

### User Service (Port 3002)
- User CRUD operations
- Profile management

### Patient Service (Port 3003)
- Patient management
- Medical records

### Appointment Service (Port 3004)
- Appointment scheduling
- Calendar management

---

## 📝 Code Standards

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Validation**: Joi
- **Authentication**: JWT

---

## 🆘 Need Help?

- Check [Setup Guide](./SETUP_GUIDE.md) for environment issues
- See [API Documentation](./API_DOCUMENTATION.md) for endpoint details
- Review [Architecture Guide](./ARCHITECTURE.md) for system design
- Check [Testing Guide](./TESTING_GUIDE.md) for testing examples

---

## 📧 Contact

For questions or issues, please contact the development team.

