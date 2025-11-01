#!/bin/bash

# VirtualDoc - Cross-Platform Dependencies Installation Script
# This script installs all required dependencies for macOS, Linux, and Windows (WSL/Git Bash)

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
echo -e "${BLUE}  VirtualDoc Dependencies Installation ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect OS
detect_os

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"
print_info "Installing dependencies for all services..."

# Function to install dependencies for a service
install_service_deps() {
    local service_path=$1
    local service_name=$2
    
    if [ -d "$service_path" ] && [ -f "$service_path/package.json" ]; then
        print_info "Installing dependencies for $service_name..."
        cd "$service_path"
        
        # Use npm ci for faster, reliable installs in CI environments
        if [ -f "package-lock.json" ]; then
            if npm ci --silent; then
                print_status "$service_name dependencies installed" 0
            else
                print_status "$service_name dependencies installation failed" 1
                return 1
            fi
        else
            if npm install --silent; then
                print_status "$service_name dependencies installed" 0
            else
                print_status "$service_name dependencies installation failed" 1
                return 1
            fi
        fi
        
        cd "$PROJECT_ROOT"
    else
        print_warning "$service_name not found or no package.json"
    fi
}

# Install backend dependencies
echo ""
echo -e "${BLUE}Installing Backend Dependencies${NC}"
echo "----------------------------------------"

# Common services
install_service_deps "$PROJECT_ROOT/backend/common/auth-service" "Auth Service"
install_service_deps "$PROJECT_ROOT/backend/common/user-service" "User Service"
install_service_deps "$PROJECT_ROOT/backend/common/notification-service" "Notification Service"
install_service_deps "$PROJECT_ROOT/backend/common/file-service" "File Service"
install_service_deps "$PROJECT_ROOT/backend/common/audit-service" "Audit Service"

# Specific services
install_service_deps "$PROJECT_ROOT/backend/specific/patient-service" "Patient Service"
install_service_deps "$PROJECT_ROOT/backend/specific/appointment-service" "Appointment Service"
install_service_deps "$PROJECT_ROOT/backend/specific/medical-records-service" "Medical Records Service"
install_service_deps "$PROJECT_ROOT/backend/specific/billing-service" "Billing Service"
install_service_deps "$PROJECT_ROOT/backend/specific/inventory-service" "Inventory Service"
install_service_deps "$PROJECT_ROOT/backend/specific/reporting-service" "Reporting Service"
install_service_deps "$PROJECT_ROOT/backend/specific/discovery-service" "Discovery Service"

# Install frontend dependencies
echo ""
echo -e "${BLUE}Installing Frontend Dependencies${NC}"
echo "----------------------------------------"

install_service_deps "$PROJECT_ROOT/frontend/web-app" "Web App"
install_service_deps "$PROJECT_ROOT/frontend/patient-portal" "Patient Portal"
install_service_deps "$PROJECT_ROOT/frontend/admin-dashboard" "Admin Dashboard"
install_service_deps "$PROJECT_ROOT/frontend/mobile-app" "Mobile App"
install_service_deps "$PROJECT_ROOT/frontend/patient-discovery-app" "Patient Discovery App"

# Install global dependencies
echo ""
echo -e "${BLUE}Installing Global Dependencies${NC}"
echo "----------------------------------------"

print_info "Installing global development tools..."

# Function to install global package
install_global_package() {
    local package_name=$1
    local check_command=$2
    
    if command -v "$check_command" &> /dev/null; then
        print_status "$package_name already installed globally" 0
    else
        print_info "Installing $package_name globally..."
        if npm install -g "$package_name" --silent; then
            print_status "$package_name installed globally" 0
        else
            print_status "$package_name global installation failed" 1
        fi
    fi
}

# Install global packages
install_global_package "typescript" "tsc"
install_global_package "nodemon" "nodemon"
install_global_package "pm2" "pm2"
install_global_package "eslint" "eslint"
install_global_package "prettier" "prettier"

# Install Expo CLI for mobile development
if [[ "$OS" == "windows" ]]; then
    # On Windows, use npx for Expo CLI to avoid permission issues
    print_info "Setting up Expo CLI (using npx)..."
    print_status "Expo CLI will be available via npx expo" 0
else
    install_global_package "@expo/cli" "expo"
fi

# Install React Native CLI
if [[ "$OS" == "windows" ]]; then
    # On Windows, use npx for React Native CLI
    print_info "Setting up React Native CLI (using npx)..."
    print_status "React Native CLI will be available via npx react-native" 0
else
    install_global_package "@react-native-community/cli" "react-native"
fi

# Create symlinks for shared libraries
echo ""
echo -e "${BLUE}Setting up Shared Libraries${NC}"
echo "----------------------------------------"

SHARED_LIB_PATH="$PROJECT_ROOT/backend/shared"
if [ -d "$SHARED_LIB_PATH" ]; then
    print_info "Setting up shared library symlinks..."
    
    # Create symlinks in each service
    for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
        if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
            service_name=$(basename "$service_dir")
            shared_link="$service_dir/shared"
            
            if [ ! -L "$shared_link" ]; then
                ln -sf "$SHARED_LIB_PATH" "$shared_link"
                print_status "Shared library linked for $service_name" 0
            else
                print_status "Shared library already linked for $service_name" 0
            fi
        fi
    done
else
    print_warning "Shared library directory not found"
fi

# Install Docker images
echo ""
echo -e "${BLUE}Pulling Docker Images${NC}"
echo "----------------------------------------"

print_info "Pulling required Docker images..."

# Function to pull Docker image
pull_docker_image() {
    local image_name=$1
    local image_tag=$2
    
    if docker pull "$image_name:$image_tag" --quiet; then
        print_status "$image_name:$image_tag Docker image pulled" 0
    else
        print_status "$image_name:$image_tag Docker image pull failed" 1
    fi
}

# Pull required images
pull_docker_image "postgres" "15-alpine"
pull_docker_image "redis" "7-alpine"
pull_docker_image "elasticsearch" "8.8.0"
pull_docker_image "nginx" "alpine"
pull_docker_image "node" "18-alpine"

# Create development environment file
echo ""
echo -e "${BLUE}Creating Environment Files${NC}"
echo "----------------------------------------"

# Copy environment example files
if [ -f "$PROJECT_ROOT/config/environments/env.example" ]; then
    cp "$PROJECT_ROOT/config/environments/env.example" "$PROJECT_ROOT/.env.development"
    print_status "Development environment file created" 0
else
    print_warning "Environment example file not found"
fi

# Create staging environment file
if [ -f "$PROJECT_ROOT/config/environments/env.example" ]; then
    cp "$PROJECT_ROOT/config/environments/env.example" "$PROJECT_ROOT/.env.staging"
    print_status "Staging environment file created" 0
else
    print_warning "Environment example file not found"
fi

# Create production environment file
if [ -f "$PROJECT_ROOT/config/environments/env.example" ]; then
    cp "$PROJECT_ROOT/config/environments/env.example" "$PROJECT_ROOT/.env.production"
    print_status "Production environment file created" 0
else
    print_warning "Environment example file not found"
fi

# Set up Git hooks
echo ""
echo -e "${BLUE}Setting up Git Hooks${NC}"
echo "----------------------------------------"

HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
if [ -d "$HOOKS_DIR" ]; then
    # Pre-commit hook
    cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Run linting before commit
echo "Running pre-commit checks..."
npm run lint:check || exit 1
echo "Pre-commit checks passed!"
EOF
    chmod +x "$HOOKS_DIR/pre-commit"
    print_status "Pre-commit hook installed" 0
    
    # Pre-push hook
    cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash
# Run tests before push
echo "Running tests before push..."
npm run test || exit 1
echo "Tests passed!"
EOF
    chmod +x "$HOOKS_DIR/pre-push"
    print_status "Pre-push hook installed" 0
else
    print_warning "Git hooks directory not found"
fi

# Create OS-specific setup scripts
echo ""
echo -e "${BLUE}Creating OS-Specific Setup Scripts${NC}"
echo "----------------------------------------"

# Create Windows batch script
cat > "$PROJECT_ROOT/scripts/setup/install-dependencies.bat" << 'EOF'
@echo off
echo Installing VirtualDoc dependencies on Windows...
echo.

REM Install backend dependencies
echo Installing Backend Dependencies...
for /d %%i in (backend\common\*) do (
    if exist "%%i\package.json" (
        echo Installing dependencies for %%~ni...
        cd "%%i"
        call npm install --silent
        cd ..\..\..
    )
)

for /d %%i in (backend\specific\*) do (
    if exist "%%i\package.json" (
        echo Installing dependencies for %%~ni...
        cd "%%i"
        call npm install --silent
        cd ..\..\..
    )
)

REM Install frontend dependencies
echo Installing Frontend Dependencies...
for /d %%i in (frontend\*) do (
    if exist "%%i\package.json" (
        echo Installing dependencies for %%~ni...
        cd "%%i"
        call npm install --silent
        cd ..\..
    )
)

REM Install global dependencies
echo Installing Global Dependencies...
call npm install -g typescript --silent
call npm install -g nodemon --silent
call npm install -g pm2 --silent
call npm install -g eslint --silent
call npm install -g prettier --silent

echo.
echo Dependencies installation completed!
pause
EOF

print_status "Windows batch script created" 0

# Create PowerShell script
cat > "$PROJECT_ROOT/scripts/setup/install-dependencies.ps1" << 'EOF'
# VirtualDoc Dependencies Installation Script for PowerShell

Write-Host "Installing VirtualDoc dependencies..." -ForegroundColor Cyan
Write-Host ""

# Function to install service dependencies
function Install-ServiceDependencies {
    param(
        [string]$ServicePath,
        [string]$ServiceName
    )
    
    if (Test-Path "$ServicePath\package.json") {
        Write-Host "Installing dependencies for $ServiceName..." -ForegroundColor Yellow
        Set-Location $ServicePath
        
        if (Test-Path "package-lock.json") {
            npm ci --silent
        } else {
            npm install --silent
        }
        
        Set-Location $PSScriptRoot\..\..
        Write-Host "✓ $ServiceName dependencies installed" -ForegroundColor Green
    }
}

# Install backend dependencies
Write-Host "Installing Backend Dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------------------"

Get-ChildItem "backend\common" -Directory | ForEach-Object {
    Install-ServiceDependencies $_.FullName $_.Name
}

Get-ChildItem "backend\specific" -Directory | ForEach-Object {
    Install-ServiceDependencies $_.FullName $_.Name
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------------------"

Get-ChildItem "frontend" -Directory | ForEach-Object {
    Install-ServiceDependencies $_.FullName $_.Name
}

# Install global dependencies
Write-Host ""
Write-Host "Installing Global Dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------------------"

$globalPackages = @("typescript", "nodemon", "pm2", "eslint", "prettier")

foreach ($package in $globalPackages) {
    Write-Host "Installing $package globally..." -ForegroundColor Yellow
    npm install -g $package --silent
    Write-Host "✓ $package installed globally" -ForegroundColor Green
}

Write-Host ""
Write-Host "Dependencies installation completed!" -ForegroundColor Green
Read-Host "Press Enter to continue"
EOF

print_status "PowerShell script created" 0

# Create root package.json if it doesn't exist
echo ""
echo -e "${BLUE}Creating Root Package.json${NC}"
echo "----------------------------------------"

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

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"
print_status "Logs directory created" 0

# Create backup directory
mkdir -p "$PROJECT_ROOT/backups"
print_status "Backup directory created" 0

# OS-specific final instructions
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Dependencies Installation Complete! ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Next steps:"
if [[ "$OS" == "windows" ]]; then
    print_info "1. Run: .\\scripts\\setup\\setup-environment.bat"
    print_info "2. Run: .\\scripts\\setup\\setup-database.bat"
    print_info "3. Run: .\\scripts\\dev\\start-dev.bat"
    echo ""
    print_info "Or use PowerShell:"
    print_info "1. Run: .\\scripts\\setup\\setup-environment.ps1"
    print_info "2. Run: .\\scripts\\setup\\setup-database.ps1"
    print_info "3. Run: .\\scripts\\dev\\start-dev.ps1"
else
    print_info "1. Run: ./scripts/setup/setup-environment.sh"
    print_info "2. Run: ./scripts/setup/setup-database.sh"
    print_info "3. Run: ./scripts/dev/start-dev.sh"
fi
echo ""
print_info "Available commands:"
print_info "- npm run start:dev (Development)"
print_info "- npm run start:staging (Staging)"
print_info "- npm run start:prod (Production)"
echo ""
print_info "Cross-platform scripts created:"
print_info "- Shell scripts (.sh) for macOS/Linux/WSL"
print_info "- Batch scripts (.bat) for Windows Command Prompt"
print_info "- PowerShell scripts (.ps1) for Windows PowerShell"