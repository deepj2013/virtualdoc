#!/bin/bash

# VirtualDoc - Development Start Script (Single Port)
# Runs everything on port 3003 for easy development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc - Development Mode         ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Node.js is installed
if ! command -v node > /dev/null 2>&1; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is available${NC}"

# Check if npm is installed
if ! command -v npm > /dev/null 2>&1; then
    echo -e "${RED}❌ npm not found. Please install npm and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm is available${NC}"

# Navigate to frontend directory
cd frontend/web-app

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Dependencies are ready${NC}"

# Start the development server
echo -e "${YELLOW}🚀 Starting development server...${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  🎉 VirtualDoc is ready!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${BLUE}🌐 Access your application:${NC}"
echo "  • Web App: http://localhost:3003"
echo ""
echo -e "${BLUE}📝 Development Info:${NC}"
echo "  • Hot reload enabled"
echo "  • TypeScript support"
echo "  • Tailwind CSS included"
echo "  • React Router for navigation"
echo ""
echo -e "${BLUE}🎯 Features Available:${NC}"
echo "  • Landing page with three-tier pricing"
echo "  • Role-based navigation"
echo "  • Responsive design"
echo "  • Modern UI components"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

# Start Vite dev server
npm run dev
