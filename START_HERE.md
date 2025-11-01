# 🚀 VirtualDoc - Step by Step Startup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js >= 18.0.0
- ✅ npm >= 9.0.0
- ✅ Docker Desktop installed and running
- ✅ Git installed

---

## Step 1: Verify Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker
docker --version
docker-compose --version

# Verify Docker is running
docker ps
```

---

## Step 2: Clone/Navigate to Project

```bash
# If you need to clone
# git clone <repository-url>
# cd virtualDoc

# Or if already in project directory
cd /Volumes/Data/Product/virtualDoc
```

---

## Step 3: Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

This installs dependencies for:
- Root workspace
- All backend services
- All frontend apps

**Expected time:** 2-5 minutes

---

## Step 4: Setup Environment Variables

```bash
# Copy example environment file
cp env.example .env

# Edit .env if needed (defaults work for local development)
# nano .env  # or use your preferred editor
```

**Default values (already in env.example):**
```
DB_NAME=virtualdoc
DB_USER=virtualdoc
DB_PASSWORD=virtualdoc123
DB_PORT=5432
JWT_SECRET=your-secret-key-change-in-production
```

---

## Step 5: Start All Services with Docker

```bash
# Start all services (PostgreSQL, Redis, and all microservices)
npm run dev

# OR using docker-compose directly
docker-compose up
```

**What this starts:**
1. 🗄️ **PostgreSQL** - Database (port 5432)
2. 💾 **Redis** - Cache (port 6379)
3. 🔐 **Auth Service** - Authentication API (port 3001)
4. 👤 **User Service** - User Management (port 3002)
5. 🏥 **Patient Service** - Patient Management (port 3003)
6. 📅 **Appointment Service** - Appointments (port 3004)
7. 🌐 **Web App** - Frontend (port 3000)

**Expected time:** 30-60 seconds for all containers to start

---

## Step 6: Verify Services Are Running

```bash
# Check Docker containers
docker-compose ps

# Check service health
curl http://localhost:3001/health

# Check root endpoint
curl http://localhost:3001/
```

**Expected output:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-11-01T20:00:00.000Z"
}
```

---

## Step 7: Test API Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Create Universal Admin
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

**Expected Response:**
```json
{
  "success": true,
  "message": "Universal Admin account created successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@test.com",
      "firstName": "Test",
      "lastName": "Admin",
      "adminRoleCode": "universal_admin"
    }
  }
}
```

---

## Step 8: Verify Database Connection

```bash
# Check if user was created in database
docker-compose exec postgres psql -U virtualdoc -d virtualdoc -c "SELECT email, first_name, last_name FROM users;"
```

---

## Step 9: Access Services

Once everything is running:

- 🌐 **Frontend Web App:** http://localhost:3000
- 🔐 **Auth Service API:** http://localhost:3001
- 📊 **API Documentation:** See `docs/API_DOCUMENTATION.md`
- 📮 **Postman Collection:** `docs/postman/VirtualDoc_API_Collection.json`

---

## Step 10: Using Postman

1. Open Postman
2. Click **Import**
3. Select file: `docs/postman/VirtualDoc_API_Collection.json`
4. Collection is ready with:
   - Base URL: `http://localhost:3001`
   - Health Check endpoint
   - Signup endpoint
   - Login endpoint

---

## 🛑 Stopping Services

```bash
# Stop all services
npm run stop

# OR
docker-compose down

# Stop and remove volumes (clean restart)
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows

# Change port in docker-compose.yml or .env
```

### Database Connection Error
```bash
# Check if PostgreSQL container is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Services Not Starting
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs auth-service

# Rebuild containers
docker-compose build --no-cache
docker-compose up
```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove all Docker images (if needed)
docker system prune -a

# Start fresh
npm run dev
```

---

## 📚 Next Steps

1. Read `README.md` for project overview
2. Check `docs/API_DOCUMENTATION.md` for API details
3. Review `docs/ARCHITECTURE.md` for system design
4. See `docs/API_STATUS.md` for current API status

---

## ✅ Quick Verification Checklist

- [ ] All Docker containers running: `docker-compose ps`
- [ ] Health check working: `curl http://localhost:3001/health`
- [ ] Database connected (check logs for "Database connected successfully")
- [ ] Can create admin user via signup API
- [ ] Database shows created users

---

**Need Help?** Check the `docs/` folder for detailed documentation.

**Last Updated:** 2025-11-02

