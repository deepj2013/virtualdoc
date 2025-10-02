#!/bin/bash

# VirtualDoc - Cross-Platform Quick Start Script
# This script provides a one-command setup for the VirtualDoc development environment

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
echo -e "${BLUE}  VirtualDoc Quick Start               ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect OS
detect_os

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

print_info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Function to run script with error handling
run_script() {
    local script_path=$1
    local script_name=$2
    
    if [ -f "$script_path" ]; then
        print_info "Running $script_name..."
        if bash "$script_path"; then
            print_status "$script_name completed successfully" 0
        else
            print_status "$script_name failed" 1
            echo -e "${RED}Please fix the errors above and try again${NC}"
            exit 1
        fi
    else
        print_status "$script_name not found" 1
        exit 1
    fi
}

# Step 1: Check Requirements
echo ""
echo -e "${BLUE}Step 1: Checking Requirements${NC}"
echo "----------------------------------------"

run_script "scripts/setup/check-requirements.sh" "Requirements Check"

# Step 2: Install Dependencies
echo ""
echo -e "${BLUE}Step 2: Installing Dependencies${NC}"
echo "----------------------------------------"

run_script "scripts/setup/install-dependencies.sh" "Dependencies Installation"

# Step 3: Setup Environment
echo ""
echo -e "${BLUE}Step 3: Setting up Environment${NC}"
echo "----------------------------------------"

run_script "scripts/setup/setup-environment.sh" "Environment Setup"

# Step 4: Setup Database
echo ""
echo -e "${BLUE}Step 4: Setting up Database${NC}"
echo "----------------------------------------"

run_script "scripts/setup/setup-database.sh" "Database Setup"

# Step 5: Start Development Environment
echo ""
echo -e "${BLUE}Step 5: Starting Development Environment${NC}"
echo "----------------------------------------"

print_info "Starting VirtualDoc development environment..."
if bash "scripts/dev/start-dev.sh"; then
    print_status "Development environment started successfully" 0
else
    print_status "Development environment startup failed" 1
    echo -e "${RED}Please check the logs and try again${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VirtualDoc Setup Complete!           ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Your VirtualDoc development environment is now ready!"
echo ""
echo -e "${BLUE}Services Available:${NC}"
echo "  • Web App:            http://localhost:3007"
echo "  • Patient Portal:     http://localhost:3008"
echo "  • Admin Dashboard:   http://localhost:3009"
echo "  • API Gateway:        http://localhost:80"
echo ""
echo -e "${BLUE}Backend Services:${NC}"
echo "  • Auth Service:        http://localhost:3001"
echo "  • User Service:        http://localhost:3002"
echo "  • Patient Service:     http://localhost:3004"
echo "  • Appointment Service: http://localhost:3005"
echo "  • Discovery Service:   http://localhost:3006"
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
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
print_info "Next steps:"
echo "  1. Open your browser and visit http://localhost:3007"
echo "  2. Start developing your features"
echo "  3. Check the documentation in the project-docs/ folder"
echo ""
print_info "Happy coding with VirtualDoc! 🚀"
