#!/bin/bash

# VirtualDoc Cross-Platform Development Environment Startup Script
# This script starts the complete development environment on macOS, Linux, and Windows (WSL/Git Bash)

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

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo "Detected OS: $OS"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc Development Environment   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect OS
detect_os

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Check if environment is set up
if [ ! -f ".env.development" ]; then
    print_warning "Environment not set up. Running setup..."
    ./scripts/setup/setup-environment.sh
fi

# Load development environment
print_info "Loading development environment..."
export NODE_ENV=development
export $(cat .env.development | grep -v '^#' | xargs)

# Function to check if port is available (cross-platform)
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -i :$port &> /dev/null
    elif command -v netstat &> /dev/null; then
        netstat -an | grep -q ":$port "
    else
        # Fallback - assume port is available
        return 0
    fi
}

# Function to kill process on port (cross-platform)
kill_port() {
    local port=$1
    local pid=""
    
    if command -v lsof &> /dev/null; then
        pid=$(lsof -ti :$port 2>/dev/null)
    elif command -v netstat &> /dev/null && command -v taskkill &> /dev/null; then
        # Windows
        pid=$(netstat -ano | grep ":$port " | awk '{print $5}' | head -1)
    fi
    
    if [ ! -z "$pid" ]; then
        if command -v kill &> /dev/null; then
            kill -9 $pid 2>/dev/null || true
        elif command -v taskkill &> /dev/null; then
            taskkill /F /PID $pid 2>/dev/null || true
        fi
        print_info "Killed process on port $port"
    fi
}

# Clean up any existing processes
print_info "Cleaning up existing processes..."
for port in 3000 3001 3002 3003 3004 3005 5432 6379 9200; do
    kill_port $port
done

# Start infrastructure services
echo ""
echo -e "${BLUE}Starting Infrastructure Services${NC}"
echo "----------------------------------------"

print_info "Starting PostgreSQL, Redis, Elasticsearch, and Nginx..."
if docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis elasticsearch nginx; then
    print_status "Infrastructure services started" 0
else
    print_status "Failed to start infrastructure services" 1
    exit 1
fi

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 15

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

print_info "Running database migrations..."
if ./scripts/setup/setup-database.sh; then
    print_status "Database migrations completed" 0
else
    print_status "Database migrations failed" 1
    exit 1
fi

# Function to start a service (cross-platform)
start_service() {
    local service_path=$1
    local service_name=$2
    local port=$3
    
    if [ -d "$service_path" ] && [ -f "$service_path/package.json" ]; then
        print_info "Starting $service_name on port $port..."
        cd "$service_path"
        
        # Check if port is available
        if check_port $port; then
            # Start service in background
            if [[ "$OS" == "windows" ]]; then
                # Windows-specific startup
                start /B npm run dev > "../../logs/$service_name.log" 2>&1
            else
                # Unix-like systems
                npm run dev > "../../logs/$service_name.log" 2>&1 &
                local pid=$!
                echo $pid > "../../logs/$service_name.pid"
                
                # Wait a moment for service to start
                sleep 3
                
                # Check if service is running
                if ps -p $pid > /dev/null; then
                    print_status "$service_name started (PID: $pid)" 0
                else
                    print_status "$service_name failed to start" 1
                fi
            fi
        else
            print_warning "Port $port is already in use, skipping $service_name"
        fi
        
        cd "$PROJECT_ROOT"
    else
        print_warning "$service_name not found or no package.json"
    fi
}

# Start backend services
echo ""
echo -e "${BLUE}Starting Backend Services${NC}"
echo "----------------------------------------"

start_service "backend/common/auth-service" "Auth Service" 3001
start_service "backend/common/user-service" "User Service" 3002
start_service "backend/common/notification-service" "Notification Service" 3003
start_service "backend/specific/patient-service" "Patient Service" 3004
start_service "backend/specific/appointment-service" "Appointment Service" 3005
start_service "backend/specific/discovery-service" "Discovery Service" 3006

# Start frontend services
echo ""
echo -e "${BLUE}Starting Frontend Services${NC}"
echo "----------------------------------------"

start_service "frontend/web-app" "Web App" 3007
start_service "frontend/patient-portal" "Patient Portal" 3008
start_service "frontend/admin-dashboard" "Admin Dashboard" 3009

# Create cross-platform service monitoring script
echo ""
echo -e "${BLUE}Creating Service Monitor${NC}"
echo "----------------------------------------"

cat > "$PROJECT_ROOT/scripts/dev/monitor-services.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Cross-Platform Service Monitor

echo "VirtualDoc Service Status"
echo "========================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
else
    OS="unknown"
fi

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

# Check backend services
echo "Backend Services:"
for service in auth-service user-service notification-service patient-service appointment-service discovery-service; do
    if [ -f "logs/$service.pid" ]; then
        pid=$(cat "logs/$service.pid")
        if ps -p $pid > /dev/null 2>&1; then
            echo "✓ $service: Running (PID: $pid)"
        else
            echo "✗ $service: Not running"
        fi
    else
        echo "✗ $service: No PID file"
    fi
done

echo ""

# Check frontend services
echo "Frontend Services:"
for service in web-app patient-portal admin-dashboard; do
    if [ -f "logs/$service.pid" ]; then
        pid=$(cat "logs/$service.pid")
        if ps -p $pid > /dev/null 2>&1; then
            echo "✓ $service: Running (PID: $pid)"
        else
            echo "✗ $service: Not running"
        fi
    else
        echo "✗ $service: No PID file"
    fi
done

echo ""

# Check port usage
echo "Port Usage:"
for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
    if lsof -i :$port &> /dev/null || netstat -an | grep -q ":$port "; then
        echo "✓ Port $port: In use"
    else
        echo "✗ Port $port: Available"
    fi
done

# OS-specific additional checks
if [[ "$OS" == "windows" ]]; then
    echo ""
    echo "Windows-specific checks:"
    echo "• Docker Desktop: $(if docker info &> /dev/null; then echo "Running"; else echo "Not running"; fi)"
    echo "• Node.js: $(node --version 2>/dev/null || echo "Not found")"
    echo "• npm: $(npm --version 2>/dev/null || echo "Not found")"
fi
EOF

chmod +x "$PROJECT_ROOT/scripts/dev/monitor-services.sh"
print_status "Service monitor created" 0

# Create cross-platform service restart script
cat > "$PROJECT_ROOT/scripts/dev/restart-services.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Cross-Platform Service Restart Script

echo "Restarting VirtualDoc services..."

# Kill all services
echo "Stopping all services..."
for pidfile in logs/*.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        if ps -p $pid > /dev/null 2>&1; then
            kill -9 $pid 2>/dev/null || true
            echo "Stopped service with PID: $pid"
        fi
        rm -f "$pidfile"
    fi
done

# Wait a moment
sleep 2

# Restart services
echo "Restarting services..."
./scripts/dev/start-dev.sh
EOF

chmod +x "$PROJECT_ROOT/scripts/dev/restart-services.sh"
print_status "Service restart script created" 0

# Create cross-platform service stop script
cat > "$PROJECT_ROOT/scripts/dev/stop-services.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Cross-Platform Service Stop Script

echo "Stopping VirtualDoc services..."

# Stop all services
for pidfile in logs/*.pid; do
    if [ -f "$pidfile" ]; then
        service_name=$(basename "$pidfile" .pid)
        pid=$(cat "$pidfile")
        if ps -p $pid > /dev/null 2>&1; then
            kill -TERM $pid 2>/dev/null || true
            echo "Stopping $service_name (PID: $pid)..."
            
            # Wait for graceful shutdown
            for i in {1..10}; do
                if ! ps -p $pid > /dev/null 2>&1; then
                    echo "✓ $service_name stopped gracefully"
                    break
                fi
                sleep 1
            done
            
            # Force kill if still running
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid 2>/dev/null || true
                echo "✓ $service_name force stopped"
            fi
        fi
        rm -f "$pidfile"
    fi
done

# Stop infrastructure services
echo "Stopping infrastructure services..."
docker-compose -f docker-compose.yml -f docker-compose.override.yml down

echo "All services stopped!"
EOF

chmod +x "$PROJECT_ROOT/scripts/dev/stop-services.sh"
print_status "Service stop script created" 0

# Wait for all services to start
print_info "Waiting for all services to start..."
sleep 10

# Check service health
echo ""
echo -e "${BLUE}Service Health Check${NC}"
echo "----------------------------------------"

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

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Development Environment Started!     ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Services are now running:"
echo ""
echo -e "${BLUE}Backend Services:${NC}"
echo "  • Auth Service:        http://localhost:3001"
echo "  • User Service:        http://localhost:3002"
echo "  • Notification Service: http://localhost:3003"
echo "  • Patient Service:     http://localhost:3004"
echo "  • Appointment Service: http://localhost:3005"
echo "  • Discovery Service:   http://localhost:3006"
echo ""
echo -e "${BLUE}Frontend Services:${NC}"
echo "  • Web App:            http://localhost:3007"
echo "  • Patient Portal:     http://localhost:3008"
echo "  • Admin Dashboard:   http://localhost:3009"
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
echo "  • API Gateway:        http://localhost:80"
echo "  • PostgreSQL:         localhost:5432"
echo "  • Redis:              localhost:6379"
echo "  • Elasticsearch:      http://localhost:9200"
echo ""
print_info "Useful commands:"
echo "  • Monitor services:   ./scripts/dev/monitor-services.sh"
echo "  • Restart services:   ./scripts/dev/restart-services.sh"
echo "  • Stop services:      ./scripts/dev/stop-services.sh"
echo "  • View logs:          tail -f logs/[service-name].log"
echo ""
if [[ "$OS" == "windows" ]]; then
    print_info "Windows-specific commands:"
    echo "  • Monitor services:   .\\scripts\\dev\\monitor-services.bat"
    echo "  • Restart services:   .\\scripts\\dev\\restart-services.bat"
    echo "  • Stop services:      .\\scripts\\dev\\stop-services.bat"
fi
echo ""
print_info "Development environment is ready for coding!"