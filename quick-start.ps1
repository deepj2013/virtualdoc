# VirtualDoc - Cross-Platform Quick Start Script
# This script provides a one-command setup for the VirtualDoc development environment

param(
    [switch]$SkipPause
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Status {
    param(
        [string]$Message,
        [bool]$Success
    )
    
    if ($Success) {
        Write-Host "✓ $Message" -ForegroundColor $Green
    } else {
        Write-Host "✗ $Message" -ForegroundColor $Red
    }
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Blue
}

function Invoke-Script {
    param(
        [string]$ScriptPath,
        [string]$ScriptName
    )
    
    if (Test-Path $ScriptPath) {
        Write-Info "Running $ScriptName..."
        try {
            & $ScriptPath
            if ($LASTEXITCODE -eq 0) {
                Write-Status "$ScriptName completed successfully" $true
            } else {
                Write-Status "$ScriptName failed" $false
                Write-Host "Please fix the errors above and try again" -ForegroundColor $Red
                if (-not $SkipPause) { Read-Host "Press Enter to continue" }
                exit 1
            }
        } catch {
            Write-Status "$ScriptName failed with error: $($_.Exception.Message)" $false
            if (-not $SkipPause) { Read-Host "Press Enter to continue" }
            exit 1
        }
    } else {
        Write-Status "$ScriptName not found" $false
        if (-not $SkipPause) { Read-Host "Press Enter to continue" }
        exit 1
    }
}

Write-Host "========================================" -ForegroundColor $Blue
Write-Host "  VirtualDoc Quick Start               " -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue
Write-Host ""

Write-Info "Detected OS: Windows (PowerShell)"

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = $ScriptDir

Write-Info "Project root: $ProjectRoot"
Set-Location $ProjectRoot

# Step 1: Check Requirements
Write-Host ""
Write-Host "Step 1: Checking Requirements" -ForegroundColor $Blue
Write-Host "----------------------------------------"

Invoke-Script "scripts\setup\check-requirements.ps1" "Requirements Check"

# Step 2: Install Dependencies
Write-Host ""
Write-Host "Step 2: Installing Dependencies" -ForegroundColor $Blue
Write-Host "----------------------------------------"

Invoke-Script "scripts\setup\install-dependencies.ps1" "Dependencies Installation"

# Step 3: Setup Environment
Write-Host ""
Write-Host "Step 3: Setting up Environment" -ForegroundColor $Blue
Write-Host "----------------------------------------"

Invoke-Script "scripts\setup\setup-environment.ps1" "Environment Setup"

# Step 4: Setup Database
Write-Host ""
Write-Host "Step 4: Setting up Database" -ForegroundColor $Blue
Write-Host "----------------------------------------"

Invoke-Script "scripts\setup\setup-database.ps1" "Database Setup"

# Step 5: Start Development Environment
Write-Host ""
Write-Host "Step 5: Starting Development Environment" -ForegroundColor $Blue
Write-Host "----------------------------------------"

Write-Info "Starting VirtualDoc development environment..."
try {
    & "scripts\dev\start-dev.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Development environment started successfully" $true
    } else {
        Write-Status "Development environment startup failed" $false
        Write-Host "Please check the logs and try again" -ForegroundColor $Red
        if (-not $SkipPause) { Read-Host "Press Enter to continue" }
        exit 1
    }
} catch {
    Write-Status "Development environment startup failed with error: $($_.Exception.Message)" $false
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor $Green
Write-Host "  VirtualDoc Setup Complete!           " -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host ""
Write-Info "Your VirtualDoc development environment is now ready!"
Write-Host ""
Write-Host "Services Available:" -ForegroundColor $Blue
Write-Host "  • Web App:            http://localhost:3007"
Write-Host "  • Patient Portal:     http://localhost:3008"
Write-Host "  • Admin Dashboard:   http://localhost:3009"
Write-Host "  • API Gateway:        http://localhost:80"
Write-Host ""
Write-Host "Backend Services:" -ForegroundColor $Blue
Write-Host "  • Auth Service:        http://localhost:3001"
Write-Host "  • User Service:        http://localhost:3002"
Write-Host "  • Patient Service:     http://localhost:3004"
Write-Host "  • Appointment Service: http://localhost:3005"
Write-Host "  • Discovery Service:   http://localhost:3006"
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor $Blue
Write-Host "  • PostgreSQL:         localhost:5432"
Write-Host "  • Redis:              localhost:6379"
Write-Host "  • Elasticsearch:      http://localhost:9200"
Write-Host ""
Write-Info "Useful commands:"
Write-Host "  • Monitor services:   .\scripts\dev\monitor-services.ps1"
Write-Host "  • Restart services:   .\scripts\dev\restart-services.ps1"
Write-Host "  • Stop services:      .\scripts\dev\stop-services.ps1"
Write-Host "  • View logs:          Get-Content logs\[service-name].log -Wait"
Write-Host ""
Write-Info "Next steps:"
Write-Host "  1. Open your browser and visit http://localhost:3007"
Write-Host "  2. Start developing your features"
Write-Host "  3. Check the documentation in the project-docs\ folder"
Write-Host ""
Write-Info "Happy coding with VirtualDoc! 🚀"

if (-not $SkipPause) { Read-Host "Press Enter to continue" }
