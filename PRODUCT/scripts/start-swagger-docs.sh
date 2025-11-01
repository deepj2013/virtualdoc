#!/bin/bash

# VirtualDoc Swagger Documentation Startup Script
# This script starts all microservices with Swagger documentation

echo "🚀 Starting VirtualDoc API Documentation Services..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}❌ Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Function to start a service
start_service() {
    local service_name=$1
    local port=$2
    local path=$3
    
    echo -e "\n${BLUE}📦 Starting $service_name...${NC}"
    
    if check_port $port; then
        cd $path
        if [ -f "package.json" ]; then
            echo -e "${YELLOW}Installing dependencies for $service_name...${NC}"
            npm install --silent
            
            echo -e "${YELLOW}Starting $service_name on port $port...${NC}"
            npm run dev &
            local pid=$!
            echo $pid > ".pid"
            
            # Wait a moment to check if service started successfully
            sleep 3
            if ps -p $pid > /dev/null; then
                echo -e "${GREEN}✅ $service_name started successfully (PID: $pid)${NC}"
            else
                echo -e "${RED}❌ Failed to start $service_name${NC}"
            fi
        else
            echo -e "${RED}❌ package.json not found in $path${NC}"
        fi
        cd - > /dev/null
    fi
}

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Please run this script from the VirtualDoc project root directory${NC}"
    exit 1
fi

# Create logs directory
mkdir -p logs

echo -e "${YELLOW}🔍 Checking port availability...${NC}"

# Check all required ports
ports=(3000 3001 3002 3003 3004)
for port in "${ports[@]}"; do
    check_port $port
done

echo -e "\n${BLUE}🚀 Starting all services...${NC}"

# Start API Gateway (Centralized Documentation)
start_service "API Gateway" 3000 "backend/api-gateway"

# Start Authentication Service
start_service "Authentication Service" 3001 "backend/common/auth-service"

# Start Discovery Service
start_service "Discovery Service" 3002 "backend/specific/discovery-service"

# Start Patient Service
start_service "Patient Service" 3003 "backend/specific/patient-service"

# Start User Service
start_service "User Service" 3004 "backend/common/user-service"

echo -e "\n${GREEN}🎉 All services started!${NC}"
echo -e "\n${BLUE}📚 API Documentation URLs:${NC}"
echo -e "${YELLOW}┌─────────────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│                    📖 Documentation URLs                    │${NC}"
echo -e "${YELLOW}├─────────────────────────────────────────────────────────────┤${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}│  🌐 Centralized API Gateway:                               │${NC}"
echo -e "${YELLOW}│     http://localhost:3000/api-docs                         │${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}│  🔐 Authentication Service:                                │${NC}"
echo -e "${YELLOW}│     http://localhost:3001/api-docs                         │${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}│  🔍 Discovery Service:                                     │${NC}"
echo -e "${YELLOW}│     http://localhost:3002/api-docs                         │${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}│  👥 Patient Service:                                       │${NC}"
echo -e "${YELLOW}│     http://localhost:3003/api-docs                         │${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}│  👤 User Service:                                          │${NC}"
echo -e "${YELLOW}│     http://localhost:3004/api-docs                         │${NC}"
echo -e "${YELLOW}│                                                             │${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────────────────────────┘${NC}"

echo -e "\n${BLUE}🏥 Health Check URLs:${NC}"
echo -e "  • API Gateway:     http://localhost:3000/health"
echo -e "  • Auth Service:    http://localhost:3001/health"
echo -e "  • Discovery Svc:   http://localhost:3002/health"
echo -e "  • Patient Svc:     http://localhost:3003/health"
echo -e "  • User Service:    http://localhost:3004/health"

echo -e "\n${BLUE}📋 API Overview:${NC}"
echo -e "  • Service Info:    http://localhost:3000/api"

echo -e "\n${YELLOW}💡 Tips:${NC}"
echo -e "  • Use the centralized documentation for an overview of all APIs"
echo -e "  • Individual service docs provide detailed endpoint information"
echo -e "  • All endpoints support 'Try it out' functionality"
echo -e "  • Use the 'Authorize' button for protected endpoints"

echo -e "\n${GREEN}✨ Happy API exploring!${NC}"

# Create a stop script
cat > stop-swagger-docs.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping VirtualDoc API Documentation Services..."

# Function to stop service
stop_service() {
    local service_name=$1
    local path=$2
    
    if [ -f "$path/.pid" ]; then
        local pid=$(cat "$path/.pid")
        if ps -p $pid > /dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$path/.pid"
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name was not running"
            rm "$path/.pid"
        fi
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "API Gateway" "backend/api-gateway"
stop_service "Authentication Service" "backend/common/auth-service"
stop_service "Discovery Service" "backend/specific/discovery-service"
stop_service "Patient Service" "backend/specific/patient-service"
stop_service "User Service" "backend/common/user-service"

echo "🎉 All services stopped!"
EOF

chmod +x stop-swagger-docs.sh

echo -e "\n${BLUE}📝 To stop all services, run:${NC}"
echo -e "  ${YELLOW}./stop-swagger-docs.sh${NC}"

echo -e "\n${GREEN}🎯 Ready to explore your APIs!${NC}"
