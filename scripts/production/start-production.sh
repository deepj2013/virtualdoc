#!/bin/bash

# VirtualDoc Production Environment Startup Script
# This script starts the production environment

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
echo -e "${BLUE}  VirtualDoc Production Environment     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Check if environment is set up
if [ ! -f ".env.production" ]; then
    print_warning "Production environment not set up. Running setup..."
    ./scripts/setup/setup-environment.sh
fi

# Load production environment
print_info "Loading production environment..."
export NODE_ENV=production
export $(cat .env.production | grep -v '^#' | xargs)

# Security check
print_info "Running security checks..."

# Check if running as root (not recommended for production)
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root is not recommended for production"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Exiting..."
        exit 1
    fi
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing..."
    npm install -g pm2
fi

# Check if SSL certificates exist
if [ ! -f "infrastructure/nginx/ssl/cert.pem" ] || [ ! -f "infrastructure/nginx/ssl/key.pem" ]; then
    print_warning "SSL certificates not found. Creating self-signed certificates..."
    mkdir -p infrastructure/nginx/ssl
    
    # Generate self-signed certificate (replace with real certificates in production)
    openssl req -x509 -newkey rsa:4096 -keyout infrastructure/nginx/ssl/key.pem -out infrastructure/nginx/ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    
    print_status "Self-signed SSL certificates created" 0
    print_warning "Replace with real SSL certificates for production use"
fi

# Start infrastructure services
echo ""
echo -e "${BLUE}Starting Infrastructure Services${NC}"
echo "----------------------------------------"

print_info "Starting PostgreSQL, Redis, Elasticsearch, and Nginx..."
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d; then
    print_status "Infrastructure services started" 0
else
    print_status "Failed to start infrastructure services" 1
    exit 1
fi

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 30

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

print_info "Running production database migrations..."
export DATABASE_URL="postgresql://virtualdoc:virtualdoc@localhost:5432/virtualdoc_prod"

# Run migrations for each service
for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        
        if [ -f "$service_dir/src/migrations/migrate.js" ]; then
            print_info "Running migrations for $service_name..."
            cd "$service_dir"
            if npm run migrate:prod; then
                print_status "$service_name migrations completed" 0
            else
                print_status "$service_name migrations failed" 1
                exit 1
            fi
            cd "$PROJECT_ROOT"
        fi
    fi
done

# Build services
echo ""
echo -e "${BLUE}Building Services${NC}"
echo "----------------------------------------"

print_info "Building all services for production..."

# Build backend services
for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
    if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
        service_name=$(basename "$service_dir")
        print_info "Building $service_name..."
        cd "$service_dir"
        if npm run build:prod; then
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
        if npm run build:prod; then
            print_status "$service_name built successfully" 0
        else
            print_status "$service_name build failed" 1
            exit 1
        fi
        cd "$PROJECT_ROOT"
    fi
done

# Run security audit
echo ""
echo -e "${BLUE}Running Security Audit${NC}"
echo "----------------------------------------"

print_info "Running npm audit..."
if npm audit --audit-level=high; then
    print_status "Security audit passed" 0
else
    print_warning "Security vulnerabilities found. Please review and fix."
fi

# Start services with PM2
echo ""
echo -e "${BLUE}Starting Services with PM2${NC}"
echo "----------------------------------------"

print_info "Starting services with PM2..."

# Stop any existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start services using ecosystem file
if pm2 start ecosystem.config.js --env production; then
    print_status "Services started with PM2" 0
else
    print_status "Failed to start services with PM2" 1
    exit 1
fi

# Setup PM2 startup
print_info "Setting up PM2 startup..."
if pm2 startup; then
    print_status "PM2 startup configured" 0
else
    print_warning "PM2 startup setup failed (may require sudo)"
fi

pm2 save

# Wait for services to start
print_info "Waiting for services to start..."
sleep 15

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

# Setup monitoring and logging
echo ""
echo -e "${BLUE}Setting up Monitoring${NC}"
echo "----------------------------------------"

# Create log rotation script
cat > "$PROJECT_ROOT/scripts/maintenance/rotate-logs.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Log Rotation Script

LOG_DIR="./logs"
MAX_SIZE="100M"
MAX_FILES=5

echo "Rotating logs..."

# Rotate PM2 logs
pm2 flush

# Rotate application logs
find "$LOG_DIR" -name "*.log" -size +$MAX_SIZE -exec mv {} {}.old \;

# Compress old logs
find "$LOG_DIR" -name "*.log.old" -exec gzip {} \;

# Remove old compressed logs
find "$LOG_DIR" -name "*.log.old.gz" -mtime +$MAX_FILES -delete

echo "Log rotation completed!"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/rotate-logs.sh"
print_status "Log rotation script created" 0

# Setup log rotation cron job
print_info "Setting up log rotation cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_ROOT/scripts/maintenance/rotate-logs.sh") | crontab -
print_status "Log rotation cron job scheduled" 0

# Create production monitoring script
cat > "$PROJECT_ROOT/scripts/production/monitor-production.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Production Monitor

echo "VirtualDoc Production Environment Status"
echo "========================================"
echo ""

# System information
echo "System Information:"
echo "  • Uptime: $(uptime -p)"
echo "  • Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "  • Memory Usage: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "  • Disk Usage: $(df -h . | awk 'NR==2{print $5}')"
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

echo ""

# Check SSL certificate
echo "SSL Certificate:"
if [ -f "infrastructure/nginx/ssl/cert.pem" ]; then
    expiry=$(openssl x509 -in infrastructure/nginx/ssl/cert.pem -noout -enddate | cut -d= -f2)
    echo "✓ SSL Certificate expires: $expiry"
else
    echo "✗ SSL Certificate not found"
fi
EOF

chmod +x "$PROJECT_ROOT/scripts/production/monitor-production.sh"
print_status "Production monitor created" 0

# Create production restart script
cat > "$PROJECT_ROOT/scripts/production/restart-production.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Production Restart Script

echo "Restarting VirtualDoc production environment..."

# Create backup before restart
echo "Creating backup..."
./scripts/maintenance/backup-database.sh

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all

# Stop infrastructure
echo "Stopping infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Wait a moment
sleep 10

# Restart production
echo "Restarting production environment..."
./scripts/production/start-production.sh
EOF

chmod +x "$PROJECT_ROOT/scripts/production/restart-production.sh"
print_status "Production restart script created" 0

# Create production stop script
cat > "$PROJECT_ROOT/scripts/production/stop-production.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Production Stop Script

echo "Stopping VirtualDoc production environment..."

# Create backup before stopping
echo "Creating backup..."
./scripts/maintenance/backup-database.sh

# Stop PM2 processes
echo "Stopping PM2 processes..."
pm2 stop all
pm2 delete all

# Stop infrastructure services
echo "Stopping infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

echo "Production environment stopped!"
EOF

chmod +x "$PROJECT_ROOT/scripts/production/stop-production.sh"
print_status "Production stop script created" 0

# Create backup script
cat > "$PROJECT_ROOT/scripts/maintenance/backup-production.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Production Backup Script

BACKUP_DIR="./backups/production"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Creating production backup..."

# Backup database
docker exec virtualdoc-postgres pg_dump -U virtualdoc virtualdoc_prod > "$BACKUP_DIR/database_$TIMESTAMP.sql"
echo "✓ Database backup created"

# Backup application files
tar -czf "$BACKUP_DIR/application_$TIMESTAMP.tar.gz" --exclude=node_modules --exclude=logs --exclude=backups .
echo "✓ Application backup created"

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$TIMESTAMP.tar.gz" .env.production ecosystem.config.js docker-compose.prod.yml
echo "✓ Configuration backup created"

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

echo "Production backup completed!"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/backup-production.sh"
print_status "Production backup script created" 0

# Setup daily backup cron job
print_info "Setting up daily backup cron job..."
(crontab -l 2>/dev/null; echo "0 3 * * * $PROJECT_ROOT/scripts/maintenance/backup-production.sh") | crontab -
print_status "Daily backup cron job scheduled" 0

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Production Environment Started!      ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Production environment is now running:"
echo ""
echo -e "${BLUE}Backend Services:${NC}"
echo "  • Auth Service:        http://localhost:3001"
echo "  • User Service:        http://localhost:3002"
echo "  • Patient Service:     http://localhost:3004"
echo "  • Appointment Service: http://localhost:3005"
echo "  • Discovery Service:   http://localhost:3006"
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
echo "  • API Gateway:        http://localhost:80"
echo "  • HTTPS Gateway:      https://localhost:443"
echo "  • PostgreSQL:         localhost:5432"
echo "  • Redis:              localhost:6379"
echo "  • Elasticsearch:      http://localhost:9200"
echo ""
print_info "Production features enabled:"
echo "  • SSL/TLS encryption"
echo "  • Process clustering with PM2"
echo "  • Automatic log rotation"
echo "  • Daily database backups"
echo "  • Health monitoring"
echo "  • Security auditing"
echo ""
print_info "Useful commands:"
echo "  • Monitor production:  ./scripts/production/monitor-production.sh"
echo "  • Restart production:  ./scripts/production/restart-production.sh"
echo "  • Stop production:     ./scripts/production/stop-production.sh"
echo "  • View PM2 logs:       pm2 logs"
echo "  • PM2 status:          pm2 status"
echo "  • Create backup:       ./scripts/maintenance/backup-production.sh"
echo ""
print_warning "Production environment is ready!"
print_warning "Remember to:"
print_warning "  • Replace self-signed SSL certificates with real ones"
print_warning "  • Configure firewall rules"
print_warning "  • Set up monitoring and alerting"
print_warning "  • Review security settings"
