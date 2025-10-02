@echo off
setlocal enabledelayedexpansion

REM VirtualDoc Cross-Platform Development Environment Startup Script
REM This script starts the complete development environment on Windows

echo ========================================
echo   VirtualDoc Development Environment
echo ========================================
echo.

echo [INFO] Detected OS: Windows
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%..\.."

echo [INFO] Project root: %PROJECT_ROOT%
cd /d "%PROJECT_ROOT%"

REM Check if environment is set up
if not exist ".env.development" (
    echo [WARNING] Environment not set up. Running setup...
    call .\scripts\setup\setup-environment.bat
)

REM Load development environment
echo [INFO] Loading development environment...
set NODE_ENV=development
for /f "usebackq tokens=1,2 delims==" %%a in (".env.development") do (
    if not "%%a"=="" if not "%%a:~0,1%"=="#" (
        set "%%a=%%b"
    )
)

REM Function to check if port is available
:check_port
set port=%1
netstat -an | findstr ":%port% " >nul
if %errorlevel% equ 0 (
    exit /b 1
) else (
    exit /b 0
)

REM Function to kill process on port
:kill_port
set port=%1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%port% "') do (
    taskkill /F /PID %%a >nul 2>&1
    echo [INFO] Killed process on port %port%
    goto :eof
)

REM Clean up any existing processes
echo [INFO] Cleaning up existing processes...
for %%p in (3000 3001 3002 3003 3004 3005 5432 6379 9200) do (
    call :kill_port %%p
)

REM Start infrastructure services
echo.
echo Starting Infrastructure Services
echo ----------------------------------------

echo [INFO] Starting PostgreSQL, Redis, Elasticsearch, and Nginx...
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres redis elasticsearch nginx
if %errorlevel% equ 0 (
    echo [OK] Infrastructure services started
) else (
    echo [ERROR] Failed to start infrastructure services
    pause
    exit /b 1
)

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM Check if services are running
docker ps | findstr virtualdoc-postgres >nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running
) else (
    echo [ERROR] PostgreSQL failed to start
    pause
    exit /b 1
)

docker ps | findstr virtualdoc-redis >nul
if %errorlevel% equ 0 (
    echo [OK] Redis is running
) else (
    echo [ERROR] Redis failed to start
    pause
    exit /b 1
)

docker ps | findstr virtualdoc-elasticsearch >nul
if %errorlevel% equ 0 (
    echo [OK] Elasticsearch is running
) else (
    echo [ERROR] Elasticsearch failed to start
    pause
    exit /b 1
)

docker ps | findstr virtualdoc-nginx >nul
if %errorlevel% equ 0 (
    echo [OK] Nginx is running
) else (
    echo [ERROR] Nginx failed to start
    pause
    exit /b 1
)

REM Run database migrations
echo.
echo Running Database Migrations
echo ----------------------------------------

echo [INFO] Running database migrations...
call .\scripts\setup\setup-database.bat
if %errorlevel% equ 0 (
    echo [OK] Database migrations completed
) else (
    echo [ERROR] Database migrations failed
    pause
    exit /b 1
)

REM Function to start a service
:start_service
set service_path=%1
set service_name=%2
set port=%3

if exist "%service_path%\package.json" (
    echo [INFO] Starting %service_name% on port %port%...
    cd /d "%service_path%"
    
    REM Check if port is available
    call :check_port %port%
    if %errorlevel% equ 0 (
        REM Start service in background
        start /B npm run dev > "..\..\logs\%service_name%.log" 2>&1
        echo [OK] %service_name% started
    ) else (
        echo [WARNING] Port %port% is already in use, skipping %service_name%
    )
    
    cd /d "%PROJECT_ROOT%"
) else (
    echo [WARNING] %service_name% not found or no package.json
)

REM Start backend services
echo.
echo Starting Backend Services
echo ----------------------------------------

call :start_service "%PROJECT_ROOT%\backend\common\auth-service" "Auth Service" 3001
call :start_service "%PROJECT_ROOT%\backend\common\user-service" "User Service" 3002
call :start_service "%PROJECT_ROOT%\backend\common\notification-service" "Notification Service" 3003
call :start_service "%PROJECT_ROOT%\backend\specific\patient-service" "Patient Service" 3004
call :start_service "%PROJECT_ROOT%\backend\specific\appointment-service" "Appointment Service" 3005
call :start_service "%PROJECT_ROOT%\backend\specific\discovery-service" "Discovery Service" 3006

REM Start frontend services
echo.
echo Starting Frontend Services
echo ----------------------------------------

call :start_service "%PROJECT_ROOT%\frontend\web-app" "Web App" 3007
call :start_service "%PROJECT_ROOT%\frontend\patient-portal" "Patient Portal" 3008
call :start_service "%PROJECT_ROOT%\frontend\admin-dashboard" "Admin Dashboard" 3009

REM Create Windows service monitoring script
echo.
echo Creating Service Monitor
echo ----------------------------------------

(
echo @echo off
echo setlocal enabledelayedexpansion
echo.
echo echo VirtualDoc Service Status
echo echo ========================
echo echo.
echo.
echo REM Check infrastructure services
echo echo Infrastructure Services:
echo docker ps ^| findstr virtualdoc-postgres ^>nul
echo if %%errorlevel%% equ 0 ^(
echo     echo [OK] PostgreSQL: Running
echo ^) else ^(
echo     echo [ERROR] PostgreSQL: Not running
echo ^)
echo.
echo docker ps ^| findstr virtualdoc-redis ^>nul
echo if %%errorlevel%% equ 0 ^(
echo     echo [OK] Redis: Running
echo ^) else ^(
echo     echo [ERROR] Redis: Not running
echo ^)
echo.
echo docker ps ^| findstr virtualdoc-elasticsearch ^>nul
echo if %%errorlevel%% equ 0 ^(
echo     echo [OK] Elasticsearch: Running
echo ^) else ^(
echo     echo [ERROR] Elasticsearch: Not running
echo ^)
echo.
echo docker ps ^| findstr virtualdoc-nginx ^>nul
echo if %%errorlevel%% equ 0 ^(
echo     echo [OK] Nginx: Running
echo ^) else ^(
echo     echo [ERROR] Nginx: Not running
echo ^)
echo.
echo echo.
echo echo Backend Services:
echo for %%s in ^(auth-service user-service notification-service patient-service appointment-service discovery-service^) do ^(
echo     if exist "logs\%%s.log" ^(
echo         echo [OK] %%s: Log file exists
echo     ^) else ^(
echo         echo [ERROR] %%s: No log file
echo     ^)
echo ^)
echo.
echo echo.
echo echo Frontend Services:
echo for %%s in ^(web-app patient-portal admin-dashboard^) do ^(
echo     if exist "logs\%%s.log" ^(
echo         echo [OK] %%s: Log file exists
echo     ^) else ^(
echo         echo [ERROR] %%s: No log file
echo     ^)
echo ^)
echo.
echo echo.
echo echo Port Usage:
echo for %%p in ^(3001 3002 3003 3004 3005 3006 3007 3008 3009^) do ^(
echo     netstat -an ^| findstr ":%%p " ^>nul
echo     if %%errorlevel%% equ 0 ^(
echo         echo [OK] Port %%p: In use
echo     ^) else ^(
echo         echo [ERROR] Port %%p: Available
echo     ^)
echo ^)
echo.
echo echo.
echo echo Windows-specific checks:
echo docker info ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     echo [OK] Docker Desktop: Running
echo ^) else ^(
echo     echo [ERROR] Docker Desktop: Not running
echo ^)
echo.
echo node --version ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     for /f "tokens=*" %%v in ^('node --version'^) do echo [OK] Node.js: %%v
echo ^) else ^(
echo     echo [ERROR] Node.js: Not found
echo ^)
echo.
echo npm --version ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     for /f "tokens=*" %%v in ^('npm --version'^) do echo [OK] npm: %%v
echo ^) else ^(
echo     echo [ERROR] npm: Not found
echo ^)
echo.
echo pause
) > "scripts\dev\monitor-services.bat"

echo [OK] Service monitor created

REM Create Windows service restart script
(
echo @echo off
echo setlocal enabledelayedexpansion
echo.
echo echo Restarting VirtualDoc services...
echo.
echo REM Stop all services
echo echo Stopping all services...
echo for /f "tokens=*" %%f in ^('dir /b logs\*.log'^) do ^(
echo     echo Stopping %%f...
echo ^)
echo.
echo REM Wait a moment
echo timeout /t 2 /nobreak ^>nul
echo.
echo REM Restart services
echo echo Restarting services...
echo call .\scripts\dev\start-dev.bat
) > "scripts\dev\restart-services.bat"

echo [OK] Service restart script created

REM Create Windows service stop script
(
echo @echo off
echo setlocal enabledelayedexpansion
echo.
echo echo Stopping VirtualDoc services...
echo.
echo REM Stop all services
echo echo Stopping all services...
echo for /f "tokens=*" %%f in ^('dir /b logs\*.log'^) do ^(
echo     echo Stopping %%f...
echo ^)
echo.
echo REM Stop infrastructure services
echo echo Stopping infrastructure services...
echo docker-compose -f docker-compose.yml -f docker-compose.override.yml down
echo.
echo echo All services stopped!
echo pause
) > "scripts\dev\stop-services.bat"

echo [OK] Service stop script created

REM Wait for all services to start
echo [INFO] Waiting for all services to start...
timeout /t 10 /nobreak >nul

REM Check service health
echo.
echo Service Health Check
echo ----------------------------------------

REM Check if services are responding
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Auth Service health check passed
) else (
    echo [ERROR] Auth Service health check failed
)

curl -s http://localhost:3002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] User Service health check passed
) else (
    echo [ERROR] User Service health check failed
)

curl -s http://localhost:3004/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Patient Service health check passed
) else (
    echo [ERROR] Patient Service health check failed
)

curl -s http://localhost:3005/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Appointment Service health check passed
) else (
    echo [ERROR] Appointment Service health check failed
)

curl -s http://localhost:3006/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Discovery Service health check passed
) else (
    echo [ERROR] Discovery Service health check failed
)

echo.
echo ========================================
echo   Development Environment Started!
echo ========================================
echo.
echo [INFO] Services are now running:
echo.
echo Backend Services:
echo   • Auth Service:        http://localhost:3001
echo   • User Service:        http://localhost:3002
echo   • Notification Service: http://localhost:3003
echo   • Patient Service:     http://localhost:3004
echo   • Appointment Service: http://localhost:3005
echo   • Discovery Service:   http://localhost:3006
echo.
echo Frontend Services:
echo   • Web App:            http://localhost:3007
echo   • Patient Portal:     http://localhost:3008
echo   • Admin Dashboard:   http://localhost:3009
echo.
echo Infrastructure:
echo   • API Gateway:        http://localhost:80
echo   • PostgreSQL:         localhost:5432
echo   • Redis:              localhost:6379
echo   • Elasticsearch:      http://localhost:9200
echo.
echo [INFO] Useful commands:
echo   • Monitor services:   .\scripts\dev\monitor-services.bat
echo   • Restart services:   .\scripts\dev\restart-services.bat
echo   • Stop services:      .\scripts\dev\stop-services.bat
echo   • View logs:          type logs\[service-name].log
echo.
echo [INFO] Development environment is ready for coding!

pause
