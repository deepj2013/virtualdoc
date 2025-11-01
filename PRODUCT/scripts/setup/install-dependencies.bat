@echo off
setlocal enabledelayedexpansion

REM VirtualDoc - Cross-Platform Dependencies Installation Script
REM This script installs all required dependencies on Windows

echo ========================================
echo   VirtualDoc Dependencies Installation
echo ========================================
echo.

echo [INFO] Detected OS: Windows
echo [INFO] Installing dependencies for all services...
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\.."

echo [INFO] Project root: %PROJECT_ROOT%
echo.

REM Install backend dependencies
echo Installing Backend Dependencies
echo ----------------------------------------

REM Common services
echo [INFO] Installing dependencies for Auth Service...
cd "%PROJECT_ROOT%\backend\common\auth-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Auth Service dependencies installed
) else (
    echo [WARNING] Auth Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for User Service...
cd "%PROJECT_ROOT%\backend\common\user-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] User Service dependencies installed
) else (
    echo [WARNING] User Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Notification Service...
cd "%PROJECT_ROOT%\backend\common\notification-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Notification Service dependencies installed
) else (
    echo [WARNING] Notification Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for File Service...
cd "%PROJECT_ROOT%\backend\common\file-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] File Service dependencies installed
) else (
    echo [WARNING] File Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Audit Service...
cd "%PROJECT_ROOT%\backend\common\audit-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Audit Service dependencies installed
) else (
    echo [WARNING] Audit Service not found or no package.json
)
cd "%PROJECT_ROOT%"

REM Specific services
echo [INFO] Installing dependencies for Patient Service...
cd "%PROJECT_ROOT%\backend\specific\patient-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Patient Service dependencies installed
) else (
    echo [WARNING] Patient Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Appointment Service...
cd "%PROJECT_ROOT%\backend\specific\appointment-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Appointment Service dependencies installed
) else (
    echo [WARNING] Appointment Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Medical Records Service...
cd "%PROJECT_ROOT%\backend\specific\medical-records-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Medical Records Service dependencies installed
) else (
    echo [WARNING] Medical Records Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Billing Service...
cd "%PROJECT_ROOT%\backend\specific\billing-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Billing Service dependencies installed
) else (
    echo [WARNING] Billing Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Inventory Service...
cd "%PROJECT_ROOT%\backend\specific\inventory-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Inventory Service dependencies installed
) else (
    echo [WARNING] Inventory Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Reporting Service...
cd "%PROJECT_ROOT%\backend\specific\reporting-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Reporting Service dependencies installed
) else (
    echo [WARNING] Reporting Service not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Discovery Service...
cd "%PROJECT_ROOT%\backend\specific\discovery-service"
if exist "package.json" (
    call npm install --silent
    echo [OK] Discovery Service dependencies installed
) else (
    echo [WARNING] Discovery Service not found or no package.json
)
cd "%PROJECT_ROOT%"

REM Install frontend dependencies
echo.
echo Installing Frontend Dependencies
echo ----------------------------------------

echo [INFO] Installing dependencies for Web App...
cd "%PROJECT_ROOT%\frontend\web-app"
if exist "package.json" (
    call npm install --silent
    echo [OK] Web App dependencies installed
) else (
    echo [WARNING] Web App not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Patient Portal...
cd "%PROJECT_ROOT%\frontend\patient-portal"
if exist "package.json" (
    call npm install --silent
    echo [OK] Patient Portal dependencies installed
) else (
    echo [WARNING] Patient Portal not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Admin Dashboard...
cd "%PROJECT_ROOT%\frontend\admin-dashboard"
if exist "package.json" (
    call npm install --silent
    echo [OK] Admin Dashboard dependencies installed
) else (
    echo [WARNING] Admin Dashboard not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Mobile App...
cd "%PROJECT_ROOT%\frontend\mobile-app"
if exist "package.json" (
    call npm install --silent
    echo [OK] Mobile App dependencies installed
) else (
    echo [WARNING] Mobile App not found or no package.json
)
cd "%PROJECT_ROOT%"

echo [INFO] Installing dependencies for Patient Discovery App...
cd "%PROJECT_ROOT%\frontend\patient-discovery-app"
if exist "package.json" (
    call npm install --silent
    echo [OK] Patient Discovery App dependencies installed
) else (
    echo [WARNING] Patient Discovery App not found or no package.json
)
cd "%PROJECT_ROOT%"

REM Install global dependencies
echo.
echo Installing Global Dependencies
echo ----------------------------------------

echo [INFO] Installing global development tools...

echo [INFO] Installing TypeScript globally...
call npm install -g typescript --silent
if %errorlevel% equ 0 (
    echo [OK] TypeScript installed globally
) else (
    echo [ERROR] TypeScript global installation failed
)

echo [INFO] Installing Nodemon globally...
call npm install -g nodemon --silent
if %errorlevel% equ 0 (
    echo [OK] Nodemon installed globally
) else (
    echo [ERROR] Nodemon global installation failed
)

echo [INFO] Installing PM2 globally...
call npm install -g pm2 --silent
if %errorlevel% equ 0 (
    echo [OK] PM2 installed globally
) else (
    echo [ERROR] PM2 global installation failed
)

echo [INFO] Installing ESLint globally...
call npm install -g eslint --silent
if %errorlevel% equ 0 (
    echo [OK] ESLint installed globally
) else (
    echo [ERROR] ESLint global installation failed
)

echo [INFO] Installing Prettier globally...
call npm install -g prettier --silent
if %errorlevel% equ 0 (
    echo [OK] Prettier installed globally
) else (
    echo [ERROR] Prettier global installation failed
)

REM Pull Docker images
echo.
echo Pulling Docker Images
echo ----------------------------------------

echo [INFO] Pulling required Docker images...

echo [INFO] Pulling PostgreSQL Docker image...
docker pull postgres:15-alpine --quiet
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL Docker image pulled
) else (
    echo [ERROR] PostgreSQL Docker image pull failed
)

echo [INFO] Pulling Redis Docker image...
docker pull redis:7-alpine --quiet
if %errorlevel% equ 0 (
    echo [OK] Redis Docker image pulled
) else (
    echo [ERROR] Redis Docker image pull failed
)

echo [INFO] Pulling Elasticsearch Docker image...
docker pull elasticsearch:8.8.0 --quiet
if %errorlevel% equ 0 (
    echo [OK] Elasticsearch Docker image pulled
) else (
    echo [ERROR] Elasticsearch Docker image pull failed
)

echo [INFO] Pulling Nginx Docker image...
docker pull nginx:alpine --quiet
if %errorlevel% equ 0 (
    echo [OK] Nginx Docker image pulled
) else (
    echo [ERROR] Nginx Docker image pull failed
)

echo [INFO] Pulling Node.js Docker image...
docker pull node:18-alpine --quiet
if %errorlevel% equ 0 (
    echo [OK] Node.js Docker image pulled
) else (
    echo [ERROR] Node.js Docker image pull failed
)

REM Create environment files
echo.
echo Creating Environment Files
echo ----------------------------------------

if exist "%PROJECT_ROOT%\config\environments\env.example" (
    copy "%PROJECT_ROOT%\config\environments\env.example" "%PROJECT_ROOT%\.env.development" >nul
    echo [OK] Development environment file created
) else (
    echo [WARNING] Environment example file not found
)

if exist "%PROJECT_ROOT%\config\environments\env.example" (
    copy "%PROJECT_ROOT%\config\environments\env.example" "%PROJECT_ROOT%\.env.staging" >nul
    echo [OK] Staging environment file created
) else (
    echo [WARNING] Environment example file not found
)

if exist "%PROJECT_ROOT%\config\environments\env.example" (
    copy "%PROJECT_ROOT%\config\environments\env.example" "%PROJECT_ROOT%\.env.production" >nul
    echo [OK] Production environment file created
) else (
    echo [WARNING] Environment example file not found
)

REM Create directories
echo.
echo Creating Directories
echo ----------------------------------------

if not exist "%PROJECT_ROOT%\logs" mkdir "%PROJECT_ROOT%\logs"
echo [OK] Logs directory created

if not exist "%PROJECT_ROOT%\backups" mkdir "%PROJECT_ROOT%\backups"
echo [OK] Backup directory created

REM Create root package.json if it doesn't exist
echo.
echo Creating Root Package.json
echo ----------------------------------------

if not exist "%PROJECT_ROOT%\package.json" (
    (
        echo {
        echo   "name": "virtualdoc",
        echo   "version": "1.0.0",
        echo   "description": "VirtualDoc - Comprehensive Healthcare Platform",
        echo   "scripts": {
        echo     "install:all": ".\\scripts\\setup\\install-dependencies.bat",
        echo     "setup:env": ".\\scripts\\setup\\setup-environment.bat",
        echo     "setup:db": ".\\scripts\\setup\\setup-database.bat",
        echo     "start:dev": ".\\scripts\\dev\\start-dev.bat",
        echo     "start:staging": ".\\scripts\\staging\\start-staging.bat",
        echo     "start:prod": ".\\scripts\\production\\start-production.bat",
        echo     "stop:dev": "docker-compose -f docker-compose.yml -f docker-compose.override.yml down",
        echo     "stop:staging": "docker-compose -f docker-compose.yml -f docker-compose.staging.yml down ^&^& pm2 stop all",
        echo     "stop:prod": "docker-compose -f docker-compose.yml -f docker-compose.prod.yml down ^&^& pm2 stop all",
        echo     "build:staging": "npm run build --workspaces",
        echo     "build:prod": "npm run build --workspaces",
        echo     "test": "npm run test --workspaces",
        echo     "lint": "npm run lint --workspaces",
        echo     "lint:fix": "npm run lint:fix --workspaces",
        echo     "clean": "rmdir /s /q node_modules ^&^& rmdir /s /q */node_modules ^&^& rmdir /s /q */*/node_modules",
        echo     "logs": "pm2 logs",
        echo     "status": "pm2 status"
        echo   },
        echo   "workspaces": [
        echo     "backend/common/*",
        echo     "backend/specific/*",
        echo     "backend/shared",
        echo     "frontend/*"
        echo   ],
        echo   "devDependencies": {
        echo     "typescript": "^5.1.3",
        echo     "nodemon": "^3.0.1",
        echo     "pm2": "^5.3.0",
        echo     "eslint": "^8.47.0",
        echo     "prettier": "^3.0.0"
        echo   }
        echo }
    ) > "%PROJECT_ROOT%\package.json"
    echo [OK] Root package.json created
) else (
    echo [OK] Root package.json already exists
)

echo.
echo ========================================
echo   Dependencies Installation Complete!
echo ========================================
echo.
echo [INFO] Next steps:
echo 1. Run: .\scripts\setup\setup-environment.bat
echo 2. Run: .\scripts\setup\setup-database.bat
echo 3. Run: .\scripts\dev\start-dev.bat
echo.
echo [INFO] Or use PowerShell:
echo 1. Run: .\scripts\setup\setup-environment.ps1
echo 2. Run: .\scripts\setup\setup-database.ps1
echo 3. Run: .\scripts\dev\start-dev.ps1
echo.
echo [INFO] Available commands:
echo - npm run start:dev (Development)
echo - npm run start:staging (Staging)
echo - npm run start:prod (Production)

pause
