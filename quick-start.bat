@echo off
setlocal enabledelayedexpansion

REM VirtualDoc - Cross-Platform Quick Start Script
REM This script provides a one-command setup for the VirtualDoc development environment

echo ========================================
echo   VirtualDoc Quick Start
echo ========================================
echo.

echo [INFO] Detected OS: Windows
echo.

REM Get the script directory
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%"

echo [INFO] Project root: %PROJECT_ROOT%
cd /d "%PROJECT_ROOT%"

REM Function to run script with error handling
:run_script
set script_path=%1
set script_name=%2

if exist "%script_path%" (
    echo [INFO] Running %script_name%...
    call "%script_path%"
    if %errorlevel% equ 0 (
        echo [OK] %script_name% completed successfully
    ) else (
        echo [ERROR] %script_name% failed
        echo [ERROR] Please fix the errors above and try again
        pause
        exit /b 1
    )
) else (
    echo [ERROR] %script_name% not found
    pause
    exit /b 1
)

REM Step 1: Check Requirements
echo.
echo Step 1: Checking Requirements
echo ----------------------------------------

call :run_script "scripts\setup\check-requirements.bat" "Requirements Check"

REM Step 2: Install Dependencies
echo.
echo Step 2: Installing Dependencies
echo ----------------------------------------

call :run_script "scripts\setup\install-dependencies.bat" "Dependencies Installation"

REM Step 3: Setup Environment
echo.
echo Step 3: Setting up Environment
echo ----------------------------------------

call :run_script "scripts\setup\setup-environment.bat" "Environment Setup"

REM Step 4: Setup Database
echo.
echo Step 4: Setting up Database
echo ----------------------------------------

call :run_script "scripts\setup\setup-database.bat" "Database Setup"

REM Step 5: Start Development Environment
echo.
echo Step 5: Starting Development Environment
echo ----------------------------------------

echo [INFO] Starting VirtualDoc development environment...
call "scripts\dev\start-dev.bat"
if %errorlevel% equ 0 (
    echo [OK] Development environment started successfully
) else (
    echo [ERROR] Development environment startup failed
    echo [ERROR] Please check the logs and try again
    pause
    exit /b 1
)

echo.
echo ========================================
echo   VirtualDoc Setup Complete!
echo ========================================
echo.
echo [INFO] Your VirtualDoc development environment is now ready!
echo.
echo Services Available:
echo   • Web App:            http://localhost:3007
echo   • Patient Portal:     http://localhost:3008
echo   • Admin Dashboard:   http://localhost:3009
echo   • API Gateway:        http://localhost:80
echo.
echo Backend Services:
echo   • Auth Service:        http://localhost:3001
echo   • User Service:        http://localhost:3002
echo   • Patient Service:     http://localhost:3004
echo   • Appointment Service: http://localhost:3005
echo   • Discovery Service:   http://localhost:3006
echo.
echo Infrastructure:
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
echo [INFO] Next steps:
echo   1. Open your browser and visit http://localhost:3007
echo   2. Start developing your features
echo   3. Check the documentation in the project-docs\ folder
echo.
echo [INFO] Happy coding with VirtualDoc! 🚀

pause
