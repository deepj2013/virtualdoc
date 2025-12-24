# Development Guide - Hot Reload Setup

## Quick Start

### For Development with Hot Reload (Recommended)

```bash
# Start all services with hot reload
npm run dev

# Or use docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### For Production Build

```bash
# Start services with production builds
docker-compose up
```

## How Hot Reload Works

### Backend Services (Auth, User, Patient, Appointment)

1. **Volume Mounts**: Source code is mounted as volumes, so changes are reflected immediately
2. **Nodemon**: Watches for file changes and automatically restarts the service
3. **TypeScript**: Uses `tsx` to run TypeScript directly without compilation

**What gets hot reloaded:**
- All `.ts` files in `src/` directory
- Configuration files (`tsconfig.json`, `package.json`)

**To see changes:**
- Edit any file in `backend/services/{service-name}/src/`
- Save the file
- Nodemon will automatically restart the service
- Check logs: `docker-compose logs -f {service-name}`

### Frontend (Web App)

1. **Volume Mounts**: Source code is mounted as volumes
2. **Vite Dev Server**: Provides instant HMR (Hot Module Replacement)
3. **Auto-reload**: Browser automatically refreshes on file changes

**What gets hot reloaded:**
- All React components (`.tsx`, `.ts`)
- CSS/Tailwind changes
- Configuration files

**To see changes:**
- Edit any file in `frontend/apps/web-app/src/`
- Save the file
- Browser will automatically refresh (or use HMR for instant updates)

## Development Commands

```bash
# Start all services with hot reload
npm run dev

# Rebuild and start (if Dockerfiles changed)
npm run dev:build

# View logs for a specific service
docker-compose logs -f auth-service
docker-compose logs -f web-app

# Stop all services
npm run stop
# or
docker-compose down

# Clean everything (containers, volumes, images)
npm run clean
```

## Service Ports (Development)

- **Frontend**: http://localhost:3000 (Vite dev server on port 5173 inside container)
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Patient Service**: http://localhost:3003
- **Appointment Service**: http://localhost:3004
- **PostgreSQL**: localhost:5433
- **Redis**: localhost:6379

## Troubleshooting

### Changes not reflecting?

1. **Check if volumes are mounted correctly:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml config | grep volumes
   ```

2. **Check service logs:**
   ```bash
   docker-compose logs -f auth-service
   ```

3. **Restart the service:**
   ```bash
   docker-compose restart auth-service
   ```

### Frontend not hot reloading?

1. **Check Vite is running:**
   - Look for "VITE" in the logs
   - Should see "Local: http://localhost:5173"

2. **Check browser console:**
   - Open DevTools
   - Look for HMR connection messages

3. **Restart web-app:**
   ```bash
   docker-compose restart web-app
   ```

### Backend not hot reloading?

1. **Check nodemon is running:**
   ```bash
   docker-compose logs auth-service | grep nodemon
   ```

2. **Check file permissions:**
   - Ensure files are readable by the container

3. **Manual restart:**
   ```bash
   docker-compose restart auth-service
   ```

## File Structure for Hot Reload

```
backend/services/auth-service/
  ├── src/              # ← Mounted volume (changes auto-reload)
  ├── package.json      # ← Mounted volume
  ├── tsconfig.json     # ← Mounted volume
  └── Dockerfile.dev    # Development Dockerfile

frontend/apps/web-app/
  ├── src/              # ← Mounted volume (changes auto-reload)
  ├── public/           # ← Mounted volume
  ├── index.html        # ← Mounted volume
  └── Dockerfile.dev    # Development Dockerfile
```

## Notes

- **First time setup**: Run `npm run dev:build` to build the images
- **Dependencies**: If you add new npm packages, rebuild: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml build`
- **Database changes**: Restart postgres service if schema changes
- **Performance**: Hot reload is slightly slower than production, but much faster for development

