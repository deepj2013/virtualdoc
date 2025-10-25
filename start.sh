#!/bin/bash

# VirtualDoc - Simple Development Start Script
# Works on macOS, Linux, and Windows (with Git Bash/WSL)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc - Healthcare Platform     ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo -e "${RED}❌ docker-compose not found. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is available${NC}"

# Stop any existing containers
echo -e "${YELLOW}🔄 Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start services
echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose up --build -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}🔍 Checking service health...${NC}"

# Check if services are running
services=("postgres" "redis" "web-app" "mock-api")
all_healthy=true

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
        all_healthy=false
    fi
done

echo ""
echo -e "${BLUE}========================================${NC}"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}  🎉 VirtualDoc is ready!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access your applications:${NC}"
    echo "  • Web App (React + Vite + Tailwind): http://localhost:3000"
    echo "  • Mock API: http://localhost:3001"
    echo ""
    echo -e "${BLUE}🗄️ Database:${NC}"
    echo "  • PostgreSQL:    localhost:5432"
    echo "  • Redis:         localhost:6379"
    echo ""
    echo -e "${BLUE}📝 Useful commands:${NC}"
    echo "  • View logs:     docker-compose logs -f"
    echo "  • Stop all:      docker-compose down"
    echo "  • Restart:       ./start.sh"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
else
    echo -e "${RED}  ❌ Some services failed to start${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
    exit 1
fi
