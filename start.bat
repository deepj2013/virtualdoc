@echo off
REM VirtualDoc - Simple Development Start Script for Windows

echo ========================================
echo   VirtualDoc - Healthcare Platform
echo ========================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose not found. Please install Docker Compose.
    pause
    exit /b 1
)

echo ✅ Docker Compose is available

REM Stop any existing containers
echo 🔄 Stopping existing containers...
docker-compose down >nul 2>&1

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running
) else (
    echo ❌ Some services failed to start
    echo Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo.
echo ========================================
echo   🎉 VirtualDoc is ready!
echo ========================================
echo.
echo 🌐 Access your applications:
echo   • Web App (React + Vite + Tailwind): http://localhost:3000
echo   • Mock API: http://localhost:3001
echo.
echo 🗄️ Database:
echo   • PostgreSQL:    localhost:5432
echo   • Redis:         localhost:6379
echo.
echo 📝 Useful commands:
echo   • View logs:     docker-compose logs -f
echo   • Stop all:      docker-compose down
echo   • Restart:       start.bat
echo.
echo Happy coding! 🚀
pause
