# VirtualDoc - Healthcare Platform

> Simple, Clean, and Easy to Run - Works on Windows, Mac, and Linux

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Copy environment file
cp env.example .env

# Edit .env if needed (defaults work for local development)
```

### 3. Start Everything
```bash
npm run dev
```

**That's it!** Your platform will be running:
- 🌐 **Frontend**: http://localhost:3000
- 🔐 **Auth Service**: http://localhost:3001
- 👤 **User Service**: http://localhost:3002
- 🏥 **Patient Service**: http://localhost:3003
- 📅 **Appointment Service**: http://localhost:3004
- 🗄️ **Database**: localhost:5432
- 💾 **Redis**: localhost:6379

## 📁 Project Structure

```
virtualDoc/
├── backend/
│   └── services/
│       ├── auth-service/      # Authentication & Authorization
│       ├── user-service/      # User Management
│       ├── patient-service/   # Patient Management
│       └── appointment-service/# Appointment Scheduling
├── frontend/
│   └── apps/
│       └── web-app/          # React Web Application
├── database/
│   └── init.sql              # Database Schema
├── docker-compose.yml         # All services configuration
├── package.json              # Workspace root
└── env.example               # Environment variables template
```

## 🛠️ Development Commands

### Start All Services
```bash
npm run dev
```
Starts all microservices and frontend using Docker Compose.

### Start Individual Services (Local Development)
```bash
# Backend service (from service directory)
cd backend/services/auth-service
npm install
npm run dev

# Frontend app (from app directory)
cd frontend/apps/web-app
npm install
npm run dev
```

### Database Commands
```bash
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed database with sample data
```

### Docker Commands
```bash
npm start            # Start services in background
npm stop             # Stop all services
npm run logs         # View all logs
npm run clean        # Stop and remove all containers/volumes
```

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and adjust as needed:
```bash
cp env.example .env
```

Key variables:
- `DB_PASSWORD`: Database password (default: virtualdoc123)
- `JWT_SECRET`: JWT signing key (change in production!)
- `*_PORT`: Service ports (defaults work fine)

### Database Setup
The database is automatically initialized when you first run `npm run dev`. The schema is loaded from `database/init.sql`.

## 📚 Services Overview

### Backend Services

#### Auth Service (Port 3001)
- User authentication (JWT)
- User registration and login
- Password reset
- Token refresh

#### User Service (Port 3002)
- User profile management
- User settings
- User preferences

#### Patient Service (Port 3003)
- Patient CRUD operations
- Patient search and filtering
- Patient history

#### Appointment Service (Port 3004)
- Appointment scheduling
- Appointment management
- Calendar integration

### Frontend Apps

#### Web App (Port 3000)
- React + Vite + TypeScript
- Tailwind CSS for styling
- Patient and doctor dashboards
- Appointment booking

## 🏗️ Architecture

- **Microservices**: Each service is independent and can be developed/deployed separately
- **Docker Compose**: All services run in containers for consistency
- **PostgreSQL**: Primary database for all services
- **Redis**: Caching and session storage
- **npm Workspaces**: Monorepo management for easy dependency handling

## 🔍 Troubleshooting

### Port Already in Use
If a port is already in use, change it in `.env`:
```
AUTH_SERVICE_PORT=3101
```

### Database Connection Issues
1. Make sure PostgreSQL container is running: `docker ps`
2. Check database logs: `docker logs virtualdoc-postgres`
3. Verify credentials in `.env` match docker-compose.yml

### Service Not Starting
1. Check logs: `npm run logs`
2. Verify Docker is running
3. Try rebuilding: `docker-compose build --no-cache`

## 📖 Documentation

- **API Documentation**: Available at `/api/docs` when services are running
- **Development Guidelines**: See `guidelines/developer/README.md`
- **Architecture**: See `docs/architecture/TECHNICAL_ARCHITECTURE.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for Healthcare**