@echo off
setlocal enabledelayedexpansion

REM VirtualDoc - Cross-Platform Development Environment Requirements Checker
REM This script checks if all required software is installed on Windows

echo ========================================
echo   VirtualDoc Environment Requirements
echo ========================================
echo.

REM Colors (Windows doesn't support ANSI colors in batch, so we'll use text)
set "RED=[ERROR]"
set "GREEN=[OK]"
set "YELLOW=[WARNING]"
set "BLUE=[INFO]"

echo %BLUE% Detected OS: Windows
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    set NODE_VERSION=!NODE_VERSION:v=!
    for /f "tokens=1 delims=." %%a in ("!NODE_VERSION!") do set NODE_MAJOR=%%a
    
    if !NODE_MAJOR! geq 18 (
        echo %GREEN% Node.js !NODE_VERSION! (>= 18.0.0 required)
    ) else (
        echo %RED% Node.js !NODE_VERSION! (>= 18.0.0 required)
        echo %RED% Please upgrade Node.js to version 18 or higher
        echo %BLUE% Installation instructions:
        echo   • Download from: https://nodejs.org/
        echo   • Or use nvm: nvm install 18 ^&^& nvm use 18
        pause
        exit /b 1
    )
) else (
    echo %RED% Node.js (>= 18.0.0 required)
    echo %RED% Node.js is not installed. Please install Node.js 18 or higher
    echo %BLUE% Installation instructions:
    echo   • Download from: https://nodejs.org/
    echo   • Or use nvm: nvm install 18 ^&^& nvm use 18
    pause
    exit /b 1
)

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo %GREEN% npm !NPM_VERSION!
) else (
    echo %RED% npm
    echo %RED% npm is not installed
    pause
    exit /b 1
)

REM Check Docker
echo Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3 delims= " %%i in ('docker --version') do set DOCKER_VERSION=%%i
    set DOCKER_VERSION=!DOCKER_VERSION:,=!
    echo %GREEN% Docker !DOCKER_VERSION!
    
    REM Check if Docker daemon is running
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo %GREEN% Docker daemon is running
    ) else (
        echo %RED% Docker daemon is running
        echo %RED% Docker daemon is not running. Please start Docker
        echo %BLUE% Start Docker:
        echo   • Start Docker Desktop
        pause
        exit /b 1
    )
) else (
    echo %RED% Docker
    echo %RED% Docker is not installed. Please install Docker
    echo %BLUE% Installation instructions:
    echo   • Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check Docker Compose
echo Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3 delims= " %%i in ('docker-compose --version') do set COMPOSE_VERSION=%%i
    set COMPOSE_VERSION=!COMPOSE_VERSION:,=!
    echo %GREEN% Docker Compose !COMPOSE_VERSION!
) else (
    docker compose version >nul 2>&1
    if %errorlevel% equ 0 (
        for /f "tokens=*" %%i in ('docker compose version --short') do set COMPOSE_VERSION=%%i
        echo %GREEN% Docker Compose (plugin) !COMPOSE_VERSION!
    ) else (
        echo %RED% Docker Compose
        echo %RED% Docker Compose is not installed. Please install Docker Compose
        echo %BLUE% Installation instructions:
        echo   • Docker Compose is included with Docker Desktop
        pause
        exit /b 1
    )
)

REM Check Git
echo Checking Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3" %%i in ('git --version') do set GIT_VERSION=%%i
    echo %GREEN% Git !GIT_VERSION!
) else (
    echo %RED% Git
    echo %RED% Git is not installed. Please install Git
    echo %BLUE% Installation instructions:
    echo   • Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check PostgreSQL (optional for development)
echo Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=3" %%i in ('psql --version') do set PSQL_VERSION=%%i
    echo %GREEN% PostgreSQL !PSQL_VERSION! (optional)
) else (
    echo %YELLOW% PostgreSQL not found (will use Docker container)
)

REM Check Redis (optional for development)
echo Checking Redis...
redis-cli --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('redis-cli --version') do set REDIS_VERSION=%%i
    echo %GREEN% Redis !REDIS_VERSION! (optional)
) else (
    echo %YELLOW% Redis not found (will use Docker container)
)

REM Check curl
echo Checking curl...
curl --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2" %%i in ('curl --version') do (
        set CURL_VERSION=%%i
        goto :curl_found
    )
    :curl_found
    echo %GREEN% curl !CURL_VERSION!
) else (
    echo %RED% curl
    echo %RED% curl is not installed. Please install curl
    echo %BLUE% Installation instructions:
    echo   • Download from: https://curl.se/download.html
    echo   • Or install Git Bash which includes curl
    pause
    exit /b 1
)

REM Check jq (optional)
echo Checking jq...
jq --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=2 delims=-" %%i in ('jq --version') do set JQ_VERSION=%%i
    echo %GREEN% jq !JQ_VERSION! (optional)
) else (
    echo %YELLOW% jq not found (optional, used for JSON processing)
    echo %BLUE% Installation instructions:
    echo   • Download from: https://stedolan.github.io/jq/download/
)

REM Check available ports (simplified check)
echo Checking required ports...
set PORT_CONFLICTS=
for %%p in (3000 3001 3002 3003 3004 5432 6379 9200) do (
    netstat -an | findstr ":%%p " >nul 2>&1
    if !errorlevel! equ 0 (
        set PORT_CONFLICTS=!PORT_CONFLICTS! %%p
    )
)

if "!PORT_CONFLICTS!"=="" (
    echo %GREEN% All required ports are available
) else (
    echo %YELLOW% Some ports are in use:!PORT_CONFLICTS!
    echo %BLUE% This might cause conflicts. Consider stopping services using these ports.
)

REM Check disk space (simplified)
echo Checking disk space...
for /f "tokens=3" %%i in ('dir /-c ^| find "bytes free"') do set FREE_SPACE=%%i
set /a FREE_SPACE_GB=!FREE_SPACE!/1024/1024/1024
if !FREE_SPACE_GB! geq 5 (
    echo %GREEN% Disk space: !FREE_SPACE_GB!G available (>= 5G required)
) else (
    echo %YELLOW% Low disk space: !FREE_SPACE_GB!G available (>= 5G recommended)
)

REM Windows-specific recommendations
echo.
echo %BLUE% Windows-Specific Recommendations:
echo   • Consider using WSL2 for better Linux compatibility
echo   • Install Git Bash for Unix-like commands
echo   • Consider using nvm for Node.js version management
echo   • Enable Windows Subsystem for Linux (WSL) for better development experience

echo.
echo ========================================
echo   All requirements check completed!
echo ========================================
echo.
echo %BLUE% You can now run:
echo   Windows: .\scripts\setup\install-dependencies.bat
echo   Or Git Bash: ./scripts/setup/install-dependencies.sh
echo.
echo %BLUE% Then run:
echo   Windows: .\scripts\setup\setup-environment.bat
echo   Or Git Bash: ./scripts/setup/setup-environment.sh

pause
