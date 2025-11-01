# VirtualDoc Setup Guide

## 📋 Prerequisites

Before setting up the development environment, ensure you have the following installed:

### Required Software

1. **Node.js** (>= 18.0.0)
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

2. **npm** (>= 9.0.0)
   ```bash
   npm --version  # Should be 9.0.0 or higher
   ```

3. **Docker Desktop**
   - macOS: Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Windows: Download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Install via package manager
   ```bash
   docker --version  # Verify installation
   ```

4. **Git**
   ```bash
   git --version
   ```

5. **PostgreSQL Client** (Optional, for direct DB access)
   - `psql` command-line tool

6. **Redis Client** (Optional, for direct cache access)
   - `redis-cli` command-line tool

---

## 🚀 Quick Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd virtualDoc
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configurations
# Required variables:
# - Database credentials
# - JWT secret
# - Service ports
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install
```

### 4. Start Docker Services

```bash
# Start database and cache
docker-compose up -d postgres redis

# Wait 10-15 seconds for services to initialize
```

### 5. Initialize Database

```bash
# Run database migrations (if any)
# Database will auto-initialize from docker-compose volume mount

# Or manually:
docker-compose exec postgres psql -U virtualdoc -d virtualdoc -f /docker-entrypoint-initdb.d/init.sql
```

### 6. Start Services

```bash
# Start all services
npm run dev

# Or start individually:
npm run dev:services  # Backend services
npm run dev:frontend  # Frontend app
```

---

## 📁 Project Structure

```
virtualDoc/
├── backend/
│   └── services/
│       ├── auth-service/        # Authentication service
│       │   ├── src/
│       │   │   ├── config/      # Database, Redis configs
│       │   │   ├── controllers/ # Request handlers
│       │   │   ├── services/    # Business logic
│       │   │   ├── helpers/     # Utility functions
│       │   │   ├── routes/      # API routes
│       │   │   ├── types/       # TypeScript types
│       │   │   └── validators/  # Validation schemas
│       │   ├── package.json
│       │   └── Dockerfile
│       ├── user-service/
│       ├── patient-service/
│       └── appointment-service/
├── frontend/
│   └── apps/
│       └── web-app/            # React application
├── database/
│   └── schema/                 # SQL schemas
│       ├── complete_schema.sql
│       └── virtualdoc_database_schema.drawio.xml
├── docs/                       # Documentation
├── config/                     # Docker, nginx configs
├── .env                        # Environment variables
├── docker-compose.yml          # Docker services
└── package.json               # Root package.json
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=virtualdoc
DB_USER=virtualdoc
DB_PASSWORD=virtualdoc123
DATABASE_URL=postgresql://virtualdoc:virtualdoc123@localhost:5432/virtualdoc

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Service Ports
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
PATIENT_SERVICE_PORT=3003
APPOINTMENT_SERVICE_PORT=3004
WEB_APP_PORT=3000

# API Configuration
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

---

## 🐳 Docker Services

### Available Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache and sessions |
| Auth Service | 3001 | Authentication API |
| User Service | 3002 | User management API |
| Patient Service | 3003 | Patient management API |
| Appointment Service | 3004 | Appointment API |
| Web App | 3000 | Frontend application |

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d auth-service

# View logs
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v

# Rebuild services
docker-compose build --no-cache auth-service
```

---

## 🧪 Testing the Setup

### 1. Check Docker Services

```bash
docker-compose ps
# All services should show "Up" status
```

### 2. Test Database Connection

```bash
# Using psql
psql -h localhost -U virtualdoc -d virtualdoc

# Or via Docker
docker-compose exec postgres psql -U virtualdoc -d virtualdoc -c "SELECT version();"
```

### 3. Test Redis Connection

```bash
# Using redis-cli
redis-cli ping
# Should return: PONG

# Or via Docker
docker-compose exec redis redis-cli ping
```

### 4. Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","service":"auth-service","timestamp":"..."}
```

### 5. Test Signup

```bash
curl -X POST http://localhost:3001/api/admin/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 🛠️ Development Workflow

### 1. Making Changes

```bash
# Make your code changes
# TypeScript files are in src/ directory

# Build TypeScript
npm run build

# Or watch mode (auto-rebuild)
npm run dev
```

### 2. Testing Changes

```bash
# Test locally
curl http://localhost:3001/health

# Use Postman collection (see docs/postman/)
```

### 3. Debugging

```bash
# View service logs
docker-compose logs -f auth-service

# View database logs
docker-compose logs -f postgres

# View all logs
docker-compose logs -f
```

---

## 🐛 Troubleshooting

### Issue: Docker not running

```bash
# Error: Cannot connect to Docker daemon
# Solution: Start Docker Desktop application
```

### Issue: Port already in use

```bash
# Find what's using the port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Change port in .env file
AUTH_SERVICE_PORT=3005
```

### Issue: Database connection failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Issue: Services not building

```bash
# Clean and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Issue: TypeScript compilation errors

```bash
# Check TypeScript config
cat backend/services/auth-service/tsconfig.json

# Rebuild
cd backend/services/auth-service
npm run build
```

---

## 📝 Next Steps

After successful setup:

1. Review [API Documentation](./API_DOCUMENTATION.md)
2. Import [Postman Collection](./postman/VirtualDoc_API_Collection.json)
3. Read [Architecture Guide](./ARCHITECTURE.md)
4. Check [Database Guide](./DATABASE_GUIDE.md)

---

## 🆘 Getting Help

- Check logs: `docker-compose logs -f [service-name]`
- Verify environment variables in `.env`
- Ensure all prerequisites are installed
- Check Docker Desktop is running
- Review error messages carefully

