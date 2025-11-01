# VirtualDoc Setup Guide

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Quick Setup (5 Minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/deepj2013/virtualdoc.git
cd virtualdoc
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit .env if needed (defaults work for local development)
```

### Step 4: Start Everything
```bash
npm run dev
```

That's it! All services will start automatically.

## What Gets Started

When you run `npm run dev`, Docker Compose will start:

1. **PostgreSQL** (port 5432) - Database
2. **Redis** (port 6379) - Cache
3. **Auth Service** (port 3001) - Authentication
4. **User Service** (port 3002) - User management
5. **Patient Service** (port 3003) - Patient management
6. **Appointment Service** (port 3004) - Appointments
7. **Web App** (port 3000) - Frontend React app

## Verify Installation

Visit these URLs in your browser:

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001/health
- **User Service**: http://localhost:3002/health
- **Patient Service**: http://localhost:3003/health
- **Appointment Service**: http://localhost:3004/health

You should see JSON responses like:
```json
{
  "status": "ok",
  "service": "auth-service"
}
```

## Development Without Docker

If you prefer to run services locally (without Docker):

### Start Backend Services
```bash
# Auth Service
cd backend/services/auth-service
npm install
npm run dev

# User Service (new terminal)
cd backend/services/user-service
npm install
npm run dev

# Patient Service (new terminal)
cd backend/services/patient-service
npm install
npm run dev

# Appointment Service (new terminal)
cd backend/services/appointment-service
npm install
npm run dev
```

### Start Frontend
```bash
cd frontend/apps/web-app
npm install
npm run dev
```

## Common Commands

```bash
npm run dev          # Start all services (Docker)
npm start            # Start services in background
npm stop             # Stop all services
npm run logs         # View all service logs
npm run clean        # Stop and remove all containers
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
```

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

1. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

2. Change the port in `.env`:
   ```
   WEB_APP_PORT=3005
   ```

### Docker Not Running
- Make sure Docker Desktop is running
- Verify: `docker ps`

### Database Connection Issues
- Wait for PostgreSQL to fully start (30 seconds)
- Check logs: `docker logs virtualdoc-postgres`
- Verify credentials in `.env` match `docker-compose.yml`

### Services Not Starting
1. Check logs: `npm run logs`
2. Rebuild containers: `docker-compose build --no-cache`
3. Restart: `npm stop && npm run dev`

## Next Steps

1. ✅ Services are running
2. 📚 Read `README.md` for architecture details
3. 💻 Start developing in `backend/services/` or `frontend/apps/`
4. 📖 Check `guidelines/developer/README.md` for coding standards

## Need Help?

- Check service logs: `npm run logs`
- Review Docker logs: `docker-compose logs [service-name]`
- See troubleshooting section above
