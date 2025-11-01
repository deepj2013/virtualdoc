# VirtualDoc - Step-by-Step Startup Guide

## 🚀 Starting Backend and Frontend

### Prerequisites Check
- ✅ Node.js: v21.5.0
- ✅ npm: 10.2.4
- ✅ Docker: 28.5.1 (needs to be running)
- ✅ .env file: Created

---

## Step-by-Step Instructions

### Step 1: Start Docker Desktop

**Important**: Docker must be running before proceeding!

- **Mac**: Open Docker Desktop from Applications
- **Windows**: Open Docker Desktop from Start Menu
- **Linux**: Run `sudo systemctl start docker`

Wait until Docker Desktop shows "Running" status.

### Step 2: Verify Docker is Running

```bash
docker ps
```

You should see an empty table (no errors). If you see an error, Docker is not running.

### Step 3: Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (backend services and frontend).

**Expected output**: Dependencies installed for all packages

### Step 4: Build Docker Images (First Time Only)

```bash
docker-compose build
```

This builds all Docker images for services. Takes 2-5 minutes the first time.

**Expected output**: Successfully built images for all services

### Step 5: Start Infrastructure Services First

Start database and cache:

```bash
docker-compose up -d postgres redis
```

Wait 10-15 seconds for services to be healthy.

**Verify**:
```bash
docker ps
```

You should see:
- `virtualdoc-postgres` (running)
- `virtualdoc-redis` (running)

### Step 6: Start Backend Services

Start all microservices:

```bash
docker-compose up -d auth-service user-service patient-service appointment-service
```

**Verify**:
```bash
docker-compose ps
```

All services should show "Up" status.

### Step 7: Start Frontend

```bash
docker-compose up -d web-app
```

### Step 8: Verify All Services are Running

```bash
docker-compose ps
```

**Expected output**: All 7 services (postgres, redis, 4 backend services, web-app) should be "Up"

### Step 9: Check Service Health

Open in browser or use curl:

```bash
# Frontend
open http://localhost:3000
# OR
curl http://localhost:3000

# Backend Services
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Patient Service
curl http://localhost:3004/health  # Appointment Service
```

---

## Alternative: Start Everything at Once

If all services are ready, you can start everything with one command:

```bash
npm run dev
# OR
docker-compose up
```

This starts all services in one go.

---

## View Logs

To see what's happening:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f web-app
```

---

## Common Issues

### Docker Not Running
```bash
# Error: Cannot connect to Docker daemon
# Solution: Start Docker Desktop
```

### Port Already in Use
```bash
# If port 3000, 3001, etc. are in use:
# 1. Find what's using the port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 2. Change port in .env file
WEB_APP_PORT=3005
```

### Services Not Starting
```bash
# Check logs
docker-compose logs [service-name]

# Restart a service
docker-compose restart [service-name]

# Rebuild and restart
docker-compose up -d --build [service-name]
```

---

## Stop All Services

```bash
docker-compose down
```

To also remove volumes (deletes database data):

```bash
docker-compose down -v
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `docker-compose up -d` | Start all services in background |
| `docker-compose ps` | Show service status |
| `docker-compose logs -f` | View all logs |
| `docker-compose stop` | Stop all services |
| `docker-compose down` | Stop and remove containers |
| `docker-compose restart [service]` | Restart specific service |

