# VirtualDoc - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites

Before setting up VirtualDoc, ensure you have the following installed:

#### Required Software
- **Docker** (20.10+) - [Download](https://docs.docker.com/get-docker/)
- **Docker Compose** (2.0+) - [Download](https://docs.docker.com/compose/install/)
- **Node.js** (18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

#### Optional Software
- **VS Code** - [Download](https://code.visualstudio.com/)
- **Postman** - [Download](https://www.postman.com/)
- **DBeaver** - [Download](https://dbeaver.io/)

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB free space
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

#### Recommended Requirements
- **CPU**: 8 cores
- **RAM**: 16GB
- **Storage**: 100GB free space
- **OS**: Windows 11+, macOS 12+, or Ubuntu 20.04+

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/deepj2013/virtualdoc.git
cd virtualdoc
```

### 2. Environment Setup

Create environment files for each service:

```bash
# Create environment files
cp .env.example .env
cp backend/common/auth-service/.env.example backend/common/auth-service/.env
cp backend/common/user-service/.env.example backend/common/user-service/.env
cp backend/common/notification-service/.env.example backend/common/notification-service/.env
cp backend/common/file-service/.env.example backend/common/file-service/.env
cp backend/common/audit-service/.env.example backend/common/audit-service/.env
```

### 3. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Database Configuration
POSTGRES_DB=virtualdoc
POSTGRES_USER=virtualdoc
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://virtualdoc:your-secure-password@postgres:5432/virtualdoc

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=virtualdoc
MINIO_SECRET_KEY=your-minio-secret-key

# Elasticsearch
ELASTICSEARCH_URL=http://elasticsearch:9200

# Application URLs
API_BASE_URL=http://localhost
WEB_APP_URL=http://localhost:3000
PATIENT_PORTAL_URL=http://localhost:3001
ADMIN_DASHBOARD_URL=http://localhost:3002
```

### 4. Start the Services

#### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option 2: Individual Service Development

```bash
# Start infrastructure services
docker-compose up -d postgres redis elasticsearch minio

# Install dependencies
cd backend/common/auth-service && npm install
cd ../user-service && npm install
cd ../notification-service && npm install
cd ../file-service && npm install
cd ../audit-service && npm install

cd ../../specific/patient-service && npm install
cd ../appointment-service && npm install
cd ../medical-records-service && npm install
cd ../billing-service && npm install
cd ../inventory-service && npm install
cd ../reporting-service && npm install

# Start services in development mode
cd ../../common/auth-service && npm run dev
cd ../user-service && npm run dev
# ... repeat for other services
```

### 5. Verify Installation

Check if all services are running:

```bash
# Check service status
docker-compose ps

# Check service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
curl http://localhost:3003/health  # Notification Service
curl http://localhost:3004/health  # File Service
curl http://localhost:3005/health  # Audit Service
curl http://localhost:4001/health  # Patient Service
curl http://localhost:4002/health  # Appointment Service
curl http://localhost:4003/health  # Medical Records Service
curl http://localhost:4004/health  # Billing Service
curl http://localhost:4005/health  # Inventory Service
curl http://localhost:4006/health  # Reporting Service
```

## 🎯 Initial Configuration

### 1. Database Setup

The database will be automatically initialized with the required tables. You can verify this by connecting to the database:

```bash
# Connect to PostgreSQL
docker exec -it virtualdoc-postgres psql -U virtualdoc -d virtualdoc

# List tables
\dt

# Exit
\q
```

### 2. Create Admin User

```bash
# Register admin user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@virtualdoc.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### 3. Access the Applications

- **Main Web App**: http://localhost:3000
- **Patient Portal**: http://localhost:3001
- **Admin Dashboard**: http://localhost:3002
- **API Gateway**: http://localhost (port 80)

## 🔧 Development Setup

### 1. Code Structure

```
virtualdoc/
├── backend/
│   ├── common/                 # Common microservices
│   │   ├── auth-service/       # Authentication service
│   │   ├── user-service/       # User management service
│   │   ├── notification-service/ # Notification service
│   │   ├── file-service/       # File storage service
│   │   └── audit-service/      # Audit logging service
│   ├── specific/               # Domain-specific services
│   │   ├── patient-service/    # Patient management
│   │   ├── appointment-service/ # Appointment scheduling
│   │   ├── medical-records-service/ # Medical records
│   │   ├── billing-service/    # Billing and payments
│   │   ├── inventory-service/  # Inventory management
│   │   └── reporting-service/  # Analytics and reporting
│   └── shared/                 # Shared libraries
├── frontend/
│   ├── web-app/               # Main web application
│   ├── patient-portal/        # Patient portal
│   ├── admin-dashboard/       # Admin dashboard
│   └── mobile-app/            # Mobile application
├── infrastructure/
│   ├── docker/                # Docker configurations
│   ├── kubernetes/            # Kubernetes manifests
│   ├── nginx/                 # API Gateway
│   └── monitoring/            # Monitoring setup
└── docs/                      # Documentation
```

### 2. Development Workflow

#### Backend Development

```bash
# Start a specific service in development mode
cd backend/common/auth-service
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

#### Frontend Development

```bash
# Start web application
cd frontend/web-app
npm start

# Start patient portal
cd frontend/patient-portal
npm start

# Start admin dashboard
cd frontend/admin-dashboard
npm start
```

### 3. API Testing

#### Using Postman

1. Import the API collection from `docs/api/VirtualDoc-API.postman_collection.json`
2. Set up environment variables in Postman
3. Start testing the APIs

#### Using cURL

```bash
# Test authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@virtualdoc.com",
    "password": "Admin123!"
  }'

# Test patient creation
curl -X POST http://localhost:4001/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01"
  }'
```

## 🐳 Docker Commands

### Common Docker Commands

```bash
# View running containers
docker ps

# View all containers
docker ps -a

# View logs for a specific service
docker logs virtualdoc-auth-service

# Restart a specific service
docker-compose restart auth-service

# Rebuild a specific service
docker-compose build auth-service

# Remove all containers and volumes
docker-compose down -v

# Clean up unused resources
docker system prune -a
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it virtualdoc-postgres psql -U virtualdoc -d virtualdoc

# Backup database
docker exec virtualdoc-postgres pg_dump -U virtualdoc virtualdoc > backup.sql

# Restore database
docker exec -i virtualdoc-postgres psql -U virtualdoc -d virtualdoc < backup.sql
```

## 🔍 Monitoring and Debugging

### 1. Service Health Checks

```bash
# Check all service health
curl http://localhost/health

# Check individual service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # User Service
# ... etc
```

### 2. Log Monitoring

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service

# View logs with timestamps
docker-compose logs -f --timestamps
```

### 3. Database Monitoring

```bash
# Connect to database
docker exec -it virtualdoc-postgres psql -U virtualdoc -d virtualdoc

# Check database size
SELECT pg_size_pretty(pg_database_size('virtualdoc'));

# Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🚀 Production Deployment

### 1. Environment Configuration

Create production environment files:

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit production configuration
nano .env.production
```

### 2. Security Configuration

```bash
# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For JWT_REFRESH_SECRET

# Update environment variables with secure values
```

### 3. SSL Certificate Setup

```bash
# Generate SSL certificates (for development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/nginx/ssl/nginx.key \
  -out infrastructure/nginx/ssl/nginx.crt
```

### 4. Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
curl https://your-domain.com/health
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :3001

# Kill process using port
sudo kill -9 $(lsof -t -i:3001)
```

#### 2. Database Connection Issues
```bash
# Check database status
docker logs virtualdoc-postgres

# Restart database
docker-compose restart postgres
```

#### 3. Service Not Starting
```bash
# Check service logs
docker logs virtualdoc-auth-service

# Check service status
docker-compose ps
```

#### 4. Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limit
# In Docker Desktop: Settings > Resources > Memory
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=virtualdoc:*

# Start services with debug logging
docker-compose up
```

## 📚 Additional Resources

### Documentation
- [API Documentation](docs/api/)
- [Architecture Guide](docs/architecture/)
- [Deployment Guide](docs/deployment/)
- [Contributing Guidelines](docs/contributing/)

### Support
- **GitHub Issues**: [Report bugs and request features](https://github.com/deepj2013/virtualdoc/issues)
- **Discord Community**: [Join our community](https://discord.gg/virtualdoc)
- **Email Support**: support@virtualdoc.health

### Learning Resources
- [Microservices Architecture](https://microservices.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Healthcare IT Standards](https://www.hl7.org/)

---

**Need Help?** Check our [FAQ](docs/FAQ.md) or reach out to our community for support!
