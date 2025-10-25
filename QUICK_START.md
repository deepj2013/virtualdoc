# 🚀 VirtualDoc - Quick Start Guide

## Super Simple Setup (Just 2 Steps!)

### 1. Prerequisites
- **Docker Desktop** (Download from [docker.com](https://www.docker.com/products/docker-desktop/))
- **Git** (Download from [git-scm.com](https://git-scm.com/))

### 2. Start the Application

**For Mac/Linux:**
```bash
./start.sh
```

**For Windows:**
```cmd
start.bat
```

**That's it!** Your app will be running at:
- 🌐 **Web App**: http://localhost:3000 (React + Vite + Tailwind CSS)
- 🔧 **API**: http://localhost:3001 (Mock API)

## What You Get

- **Frontend**: Modern React app with Vite + Tailwind CSS
- **Backend**: Mock API for development
- **Database**: PostgreSQL + Redis
- **All containerized** with Docker

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
./start.sh

# Frontend development (if you have Node.js)
cd frontend/web-app
npm run dev
```

## Troubleshooting

- **Docker not running**: Start Docker Desktop and try again
- **Port conflicts**: Stop other services using ports 3000-3001, 5432, 6379
- **Build fails**: Run `docker-compose down` then `./start.sh`
- **Need help**: Check logs with `docker-compose logs`

---

**Note**: This is a simplified setup focused on frontend development. The backend services are mocked for easy development.
