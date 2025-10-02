#!/bin/bash

# VirtualDoc - Environment Setup Script
# This script sets up the development environment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        return 1
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc Environment Setup         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"

# Function to setup environment file
setup_env_file() {
    local env_file=$1
    local env_name=$2
    
    print_info "Setting up $env_name environment..."
    
    if [ -f "$env_file" ]; then
        # Generate random secrets
        JWT_SECRET=$(openssl rand -base64 32)
        ENCRYPTION_KEY=$(openssl rand -base64 32)
        API_KEY=$(openssl rand -base64 16)
        
        # Update environment file with generated values
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$env_file"
        sed -i.bak "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" "$env_file"
        sed -i.bak "s/API_KEY=.*/API_KEY=$API_KEY/" "$env_file"
        
        # Set environment-specific values
        if [[ "$env_name" == "development" ]]; then
            sed -i.bak "s/NODE_ENV=.*/NODE_ENV=development/" "$env_file"
            sed -i.bak "s/LOG_LEVEL=.*/LOG_LEVEL=debug/" "$env_file"
            sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/virtualdoc:virtualdoc@localhost:5432\/virtualdoc_dev/" "$env_file"
            sed -i.bak "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/" "$env_file"
            sed -i.bak "s/ELASTICSEARCH_URL=.*/ELASTICSEARCH_URL=http:\/\/localhost:9200/" "$env_file"
        elif [[ "$env_name" == "staging" ]]; then
            sed -i.bak "s/NODE_ENV=.*/NODE_ENV=staging/" "$env_file"
            sed -i.bak "s/LOG_LEVEL=.*/LOG_LEVEL=info/" "$env_file"
            sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/virtualdoc:virtualdoc@localhost:5432\/virtualdoc_staging/" "$env_file"
            sed -i.bak "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/" "$env_file"
            sed -i.bak "s/ELASTICSEARCH_URL=.*/ELASTICSEARCH_URL=http:\/\/localhost:9200/" "$env_file"
        elif [[ "$env_name" == "production" ]]; then
            sed -i.bak "s/NODE_ENV=.*/NODE_ENV=production/" "$env_file"
            sed -i.bak "s/LOG_LEVEL=.*/LOG_LEVEL=error/" "$env_file"
            sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/virtualdoc:virtualdoc@localhost:5432\/virtualdoc_prod/" "$env_file"
            sed -i.bak "s/REDIS_URL=.*/REDIS_URL=redis:\/\/localhost:6379/" "$env_file"
            sed -i.bak "s/ELASTICSEARCH_URL=.*/ELASTICSEARCH_URL=http:\/\/localhost:9200/" "$env_file"
        fi
        
        # Clean up backup files
        rm -f "$env_file.bak"
        
        print_status "$env_name environment configured" 0
    else
        print_status "$env_name environment file not found" 1
    fi
}

# Setup all environment files
setup_env_file "$PROJECT_ROOT/.env.development" "development"
setup_env_file "$PROJECT_ROOT/.env.staging" "staging"
setup_env_file "$PROJECT_ROOT/.env.production" "production"

# Create Docker Compose override files
echo ""
echo -e "${BLUE}Creating Docker Compose Override Files${NC}"
echo "----------------------------------------"

# Development override
cat > "$PROJECT_ROOT/docker-compose.override.yml" << 'EOF'
version: '3.8'

services:
  # Development overrides
  postgres:
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=virtualdoc_dev
      - POSTGRES_USER=virtualdoc
      - POSTGRES_PASSWORD=virtualdoc
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./scripts/setup/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql

  redis:
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data

  elasticsearch:
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_dev_data:/usr/share/elasticsearch/data

  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl

volumes:
  postgres_dev_data:
  redis_dev_data:
  elasticsearch_dev_data:
EOF

print_status "Development Docker Compose override created" 0

# Staging override
cat > "$PROJECT_ROOT/docker-compose.staging.yml" << 'EOF'
version: '3.8'

services:
  # Staging overrides
  postgres:
    environment:
      - POSTGRES_DB=virtualdoc_staging
      - POSTGRES_USER=virtualdoc
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_staging_data:/var/lib/postgresql/data

  redis:
    volumes:
      - redis_staging_data:/data

  elasticsearch:
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    volumes:
      - elasticsearch_staging_data:/usr/share/elasticsearch/data

volumes:
  postgres_staging_data:
  redis_staging_data:
  elasticsearch_staging_data:
EOF

print_status "Staging Docker Compose override created" 0

# Production override
cat > "$PROJECT_ROOT/docker-compose.prod.yml" << 'EOF'
version: '3.8'

services:
  # Production overrides
  postgres:
    environment:
      - POSTGRES_DB=virtualdoc_prod
      - POSTGRES_USER=virtualdoc
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G

  redis:
    volumes:
      - redis_prod_data:/data
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  elasticsearch:
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    volumes:
      - elasticsearch_prod_data:/usr/share/elasticsearch/data
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G

volumes:
  postgres_prod_data:
  redis_prod_data:
  elasticsearch_prod_data:
EOF

print_status "Production Docker Compose override created" 0

# Create database initialization script
echo ""
echo -e "${BLUE}Creating Database Initialization Script${NC}"
echo "----------------------------------------"

mkdir -p "$PROJECT_ROOT/scripts/setup"

cat > "$PROJECT_ROOT/scripts/setup/init-db.sql" << 'EOF'
-- VirtualDoc Database Initialization Script

-- Create databases for different environments
CREATE DATABASE virtualdoc_dev;
CREATE DATABASE virtualdoc_staging;
CREATE DATABASE virtualdoc_prod;

-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'virtualdoc') THEN
        CREATE ROLE virtualdoc WITH LOGIN PASSWORD 'virtualdoc';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE virtualdoc_dev TO virtualdoc;
GRANT ALL PRIVILEGES ON DATABASE virtualdoc_staging TO virtualdoc;
GRANT ALL PRIVILEGES ON DATABASE virtualdoc_prod TO virtualdoc;

-- Connect to development database and create extensions
\c virtualdoc_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Connect to staging database and create extensions
\c virtualdoc_staging;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Connect to production database and create extensions
\c virtualdoc_prod;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
EOF

print_status "Database initialization script created" 0

# Create service configuration files
echo ""
echo -e "${BLUE}Creating Service Configuration Files${NC}"
echo "----------------------------------------"

# Create PM2 ecosystem file for production
cat > "$PROJECT_ROOT/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'virtualdoc-auth-service',
      script: './backend/common/auth-service/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/auth-service-error.log',
      out_file: './logs/auth-service-out.log',
      log_file: './logs/auth-service-combined.log',
      time: true
    },
    {
      name: 'virtualdoc-user-service',
      script: './backend/common/user-service/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/user-service-error.log',
      out_file: './logs/user-service-out.log',
      log_file: './logs/user-service-combined.log',
      time: true
    },
    {
      name: 'virtualdoc-patient-service',
      script: './backend/specific/patient-service/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: './logs/patient-service-error.log',
      out_file: './logs/patient-service-out.log',
      log_file: './logs/patient-service-combined.log',
      time: true
    },
    {
      name: 'virtualdoc-appointment-service',
      script: './backend/specific/appointment-service/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3004
      },
      error_file: './logs/appointment-service-error.log',
      out_file: './logs/appointment-service-out.log',
      log_file: './logs/appointment-service-combined.log',
      time: true
    },
    {
      name: 'virtualdoc-discovery-service',
      script: './backend/specific/discovery-service/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      },
      error_file: './logs/discovery-service-error.log',
      out_file: './logs/discovery-service-out.log',
      log_file: './logs/discovery-service-combined.log',
      time: true
    }
  ]
};
EOF

print_status "PM2 ecosystem configuration created" 0

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"
print_status "Logs directory created" 0

# Create SSL certificates directory
mkdir -p "$PROJECT_ROOT/infrastructure/nginx/ssl"
print_status "SSL certificates directory created" 0

# Create backup directory
mkdir -p "$PROJECT_ROOT/backups"
print_status "Backup directory created" 0

# Set up environment-specific scripts
echo ""
echo -e "${BLUE}Creating Environment-Specific Scripts${NC}"
echo "----------------------------------------"

# Development start script
cat > "$PROJECT_ROOT/scripts/dev/start-dev.sh" << 'EOF'
#!/bin/bash
# VirtualDoc Development Environment Startup Script

set -e

echo "Starting VirtualDoc Development Environment..."

# Load development environment
export NODE_ENV=development
export $(cat .env.development | grep -v '^#' | xargs)

# Start infrastructure services
echo "Starting infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis elasticsearch nginx

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
npm run db:migrate:dev

# Start all services in development mode
echo "Starting all services..."

# Start backend services
cd backend/common/auth-service && npm run dev &
cd backend/common/user-service && npm run dev &
cd backend/common/notification-service && npm run dev &
cd backend/specific/patient-service && npm run dev &
cd backend/specific/appointment-service && npm run dev &
cd backend/specific/discovery-service && npm run dev &

# Start frontend services
cd frontend/web-app && npm run dev &
cd frontend/patient-portal && npm run dev &
cd frontend/admin-dashboard && npm run dev &

echo "Development environment started!"
echo "Services available at:"
echo "- Web App: http://localhost:3000"
echo "- Patient Portal: http://localhost:3001"
echo "- Admin Dashboard: http://localhost:3002"
echo "- API Gateway: http://localhost:80"
EOF

chmod +x "$PROJECT_ROOT/scripts/dev/start-dev.sh"
print_status "Development start script created" 0

# Staging start script
cat > "$PROJECT_ROOT/scripts/staging/start-staging.sh" << 'EOF'
#!/bin/bash
# VirtualDoc Staging Environment Startup Script

set -e

echo "Starting VirtualDoc Staging Environment..."

# Load staging environment
export NODE_ENV=staging
export $(cat .env.staging | grep -v '^#' | xargs)

# Start infrastructure services
echo "Starting infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 15

# Run database migrations
echo "Running database migrations..."
npm run db:migrate:staging

# Build and start services
echo "Building services..."
npm run build:staging

# Start services with PM2
echo "Starting services with PM2..."
pm2 start ecosystem.config.js --env staging

echo "Staging environment started!"
EOF

chmod +x "$PROJECT_ROOT/scripts/staging/start-staging.sh"
print_status "Staging start script created" 0

# Production start script
cat > "$PROJECT_ROOT/scripts/production/start-production.sh" << 'EOF'
#!/bin/bash
# VirtualDoc Production Environment Startup Script

set -e

echo "Starting VirtualDoc Production Environment..."

# Load production environment
export NODE_ENV=production
export $(cat .env.production | grep -v '^#' | xargs)

# Start infrastructure services
echo "Starting infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 20

# Run database migrations
echo "Running database migrations..."
npm run db:migrate:prod

# Build services
echo "Building services..."
npm run build:prod

# Start services with PM2
echo "Starting services with PM2..."
pm2 start ecosystem.config.js --env production

# Setup PM2 startup
pm2 startup
pm2 save

echo "Production environment started!"
EOF

chmod +x "$PROJECT_ROOT/scripts/production/start-production.sh"
print_status "Production start script created" 0

# Create package.json scripts
echo ""
echo -e "${BLUE}Updating Package.json Scripts${NC}"
echo "----------------------------------------"

# Create root package.json if it doesn't exist
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    cat > "$PROJECT_ROOT/package.json" << 'EOF'
{
  "name": "virtualdoc",
  "version": "1.0.0",
  "description": "VirtualDoc - Comprehensive Healthcare Platform",
  "scripts": {
    "install:all": "./scripts/setup/install-dependencies.sh",
    "setup:env": "./scripts/setup/setup-environment.sh",
    "setup:db": "./scripts/setup/setup-database.sh",
    "start:dev": "./scripts/dev/start-dev.sh",
    "start:staging": "./scripts/staging/start-staging.sh",
    "start:prod": "./scripts/production/start-production.sh",
    "stop:dev": "docker-compose -f docker-compose.yml -f docker-compose.override.yml down",
    "stop:staging": "docker-compose -f docker-compose.yml -f docker-compose.staging.yml down && pm2 stop all",
    "stop:prod": "docker-compose -f docker-compose.yml -f docker-compose.prod.yml down && pm2 stop all",
    "build:staging": "npm run build --workspaces",
    "build:prod": "npm run build --workspaces",
    "db:migrate:dev": "npm run migrate --workspace=backend/shared",
    "db:migrate:staging": "npm run migrate:staging --workspace=backend/shared",
    "db:migrate:prod": "npm run migrate:prod --workspace=backend/shared",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "clean": "rm -rf node_modules && rm -rf */node_modules && rm -rf */*/node_modules",
    "logs": "pm2 logs",
    "status": "pm2 status"
  },
  "workspaces": [
    "backend/common/*",
    "backend/specific/*",
    "backend/shared",
    "frontend/*"
  ],
  "devDependencies": {
    "typescript": "^5.1.3",
    "nodemon": "^3.0.1",
    "pm2": "^5.3.0",
    "eslint": "^8.47.0",
    "prettier": "^3.0.0"
  }
}
EOF
    print_status "Root package.json created" 0
else
    print_status "Root package.json already exists" 0
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Environment Setup Complete!          ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Environment files created:"
print_info "- .env.development (Development)"
print_info "- .env.staging (Staging)"
print_info "- .env.production (Production)"
echo ""
print_info "Docker Compose overrides created:"
print_info "- docker-compose.override.yml (Development)"
print_info "- docker-compose.staging.yml (Staging)"
print_info "- docker-compose.prod.yml (Production)"
echo ""
print_info "Next steps:"
print_info "1. Run: ./scripts/setup/setup-database.sh"
print_info "2. Run: ./scripts/dev/start-dev.sh"
echo ""
print_info "Available commands:"
print_info "- npm run start:dev (Development)"
print_info "- npm run start:staging (Staging)"
print_info "- npm run start:prod (Production)"
