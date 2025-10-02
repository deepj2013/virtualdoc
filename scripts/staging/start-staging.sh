#!/bin/bash

# VirtualDoc Staging Environment Startup Script
# This script starts the staging environment

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
echo -e "${BLUE}  VirtualDoc Staging Environment       ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Check if environment is set up
if [ ! -f ".env.staging" ]; then
    print_warning "Staging environment not set up. Running setup..."
    ./scripts/setup/setup-environment.sh
fi

# Load staging environment
print_info "Loading staging environment..."
export NODE_ENV=staging
export $(cat .env.staging | grep -v '^#' | xargs)

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing..."
    npm install -g pm2
fi

# Start infrastructure services
echo ""
echo -e "${BLUE}Starting Infrastructure Services${NC}"
echo "----------------------------------------"

print_info "Starting PostgreSQL, Redis, Elasticsearch, and Nginx..."
if docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d; then
    print_status "Infrastructure services started" 0
else
    print_status "Failed to start infrastructure services" 1
    exit 1
fi

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 20

# Check if services are running
if docker ps | grep -q virtualdoc-postgres; then
    print_status "PostgreSQL is running" 0
else
    print_status "PostgreSQL failed to start" 1
    exit 1
fi

if docker ps | grep -q virtualdoc-redis; then
    print_status "Redis is running" 0
else
    print_status "Redis failed to start" 1
    exit 1
fi

if docker ps | grep -q virtualdoc-elasticsearch; then
    print_status "Elasticsearch is running" 0
else
    print_status "Elasticsearch failed to start" 1
    exit 1
fi

if docker ps | grep -q virtualdoc-nginx; then
    print_status "Nginx is running" 0
else
    print_status "Nginx failed to start" 1
    exit 1
fi

# Run database migrations
echo ""
echo -e "${BLUE}Running Database Migrations${NC}"
echo "----------------------------------------"

print_info "Running staging database migrations..."
export DATABASE_URL="postgresql://virtualdoc:virtualdoc@localhost:5432/virtualdoc_staging"

# Run migrations for each service
for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        
        if [ -f "$service_dir/src/migrations/migrate.js" ]; then
            print_info "Running migrations for $service_name..."
            cd "$service_dir"
            if npm run migrate:staging; then
                print_status "$service_name migrations completed" 0
            else
                print_status "$service_name migrations failed" 1
            fi
            cd "$PROJECT_ROOT"
        fi
    fi
done

# Build services
echo ""
echo -e "${BLUE}Building Services${NC}"
echo "----------------------------------------"

print_info "Building all services for staging..."

# Build backend services
for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        print_info "Building $service_name..."
        cd "$service_dir"
        if npm run build; then
            print_status "$service_name built successfully" 0
        else
            print_status "$service_name build failed" 1
            exit 1
        fi
        cd "$PROJECT_ROOT"
    fi
done

# Build frontend services
for service_dir in "$PROJECT_ROOT/frontend"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        print_info "Building $service_name..."
        cd "$service_dir"
        if npm run build:staging; then
            print_status "$service_name built successfully" 0
        else
            print_status "$service_name build failed" 1
            exit 1
        fi
        cd "$PROJECT_ROOT"
    fi
done

# Start services with PM2
echo ""
echo -e "${BLUE}Starting Services with PM2${NC}"
echo "----------------------------------------"

print_info "Starting services with PM2..."

# Stop any existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start services using ecosystem file
if pm2 start ecosystem.config.js --env staging; then
    print_status "Services started with PM2" 0
else
    print_status "Failed to start services with PM2" 1
    exit 1
fi

# Setup PM2 startup (optional)
print_info "Setting up PM2 startup..."
pm2 startup 2>/dev/null || print_warning "PM2 startup setup failed (may require sudo)"
pm2 save

# Wait for services to start
print_info "Waiting for services to start..."
sleep 10

# Check service health
echo ""
echo -e "${BLUE}Service Health Check${NC}"
echo "----------------------------------------"

# Check PM2 processes
if pm2 status | grep -q "online"; then
    print_status "PM2 services are running" 0
else
    print_status "PM2 services failed to start" 1
fi

# Check if services are responding
check_service_health() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    if curl -s "http://localhost:$port$endpoint" &> /dev/null; then
        print_status "$service_name health check passed" 0
    else
        print_status "$service_name health check failed" 1
    fi
}

check_service_health "Auth Service" 3001 "/health"
check_service_health "User Service" 3002 "/health"
check_service_health "Patient Service" 3004 "/health"
check_service_health "Appointment Service" 3005 "/health"
check_service_health "Discovery Service" 3006 "/health"

# Create staging monitoring script
echo ""
echo -e "${BLUE}Creating Staging Monitor${NC}"
echo "----------------------------------------"

cat > "$PROJECT_ROOT/scripts/staging/monitor-staging.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Staging Monitor

echo "VirtualDoc Staging Environment Status"
echo "======================================"
echo ""

# Check PM2 status
echo "PM2 Services:"
pm2 status

echo ""

# Check infrastructure services
echo "Infrastructure Services:"
if docker ps | grep -q virtualdoc-postgres; then
    echo "✓ PostgreSQL: Running"
else
    echo "✗ PostgreSQL: Not running"
fi

if docker ps | grep -q virtualdoc-redis; then
    echo "✓ Redis: Running"
else
    echo "✗ Redis: Not running"
fi

if docker ps | grep -q virtualdoc-elasticsearch; then
    echo "✓ Elasticsearch: Running"
else
    echo "✗ Elasticsearch: Not running"
fi

if docker ps | grep -q virtualdoc-nginx; then
    echo "✓ Nginx: Running"
else
    echo "✗ Nginx: Not running"
fi

echo ""

# Check service health
echo "Service Health:"
for port in 3001 3002 3004 3005 3006; do
    if curl -s "http://localhost:$port/health" &> /dev/null; then
        echo "✓ Port $port: Healthy"
    else
        echo "✗ Port $port: Unhealthy"
    fi
done
EOF

chmod +x "$PROJECT_ROOT/scripts/staging/monitor-staging.sh"
print_status "Staging monitor created" 0

# Create staging restart script
cat > "$PROJECT_ROOT/scripts/staging/restart-staging.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Staging Restart Script

echo "Restarting VirtualDoc staging environment..."

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all

# Stop infrastructure
echo "Stopping infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.staging.yml down

# Wait a moment
sleep 5

# Restart staging
echo "Restarting staging environment..."
./scripts/staging/start-staging.sh
EOF

chmod +x "$PROJECT_ROOT/scripts/staging/restart-staging.sh"
print_status "Staging restart script created" 0

# Create staging stop script
cat > "$PROJECT_ROOT/scripts/staging/stop-staging.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Staging Stop Script

echo "Stopping VirtualDoc staging environment..."

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all
pm2 delete all

# Stop infrastructure services
echo "Stopping infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.staging.yml down

echo "Staging environment stopped!"
EOF

chmod +x "$PROJECT_ROOT/scripts/staging/stop-staging.sh"
print_status "Staging stop script created" 0

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Staging Environment Started!        ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Staging environment is now running:"
echo ""
echo -e "${BLUE}Backend Services:${NC}"
echo "  • Auth Service:        http://localhost:3001"
echo "  • User Service:        http://localhost:3002"
echo "  • Patient Service:    http://localhost:3004"
echo "  • Appointment Service: http://localhost:3005"
echo "  • Discovery Service:  http://localhost:3006"
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
echo "  • API Gateway:        http://localhost:80"
echo "  • PostgreSQL:         localhost:5432"
echo "  • Redis:              localhost:6379"
echo "  • Elasticsearch:      http://localhost:9200"
echo ""
print_info "Useful commands:"
echo "  • Monitor staging:    ./scripts/staging/monitor-staging.sh"
echo "  • Restart staging:    ./scripts/staging/restart-staging.sh"
echo "  • Stop staging:       ./scripts/staging/stop-staging.sh"
echo "  • View PM2 logs:      pm2 logs"
echo "  • PM2 status:         pm2 status"
echo ""
print_info "Staging environment is ready for testing!"
