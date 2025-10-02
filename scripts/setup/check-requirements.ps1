# VirtualDoc - Cross-Platform Development Environment Requirements Checker
# This script checks if all required software is installed on Windows (PowerShell)

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

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Get-NodeVersion {
    if (Test-Command "node") {
        $version = node --version
        return $version.TrimStart('v')
    }
    return $null
}

function Get-NpmVersion {
    if (Test-Command "npm") {
        return npm --version
    }
    return $null
}

function Get-DockerVersion {
    if (Test-Command "docker") {
        $version = docker --version
        return ($version -split ' ')[2].TrimEnd(',')
    }
    return $null
}

function Get-DockerComposeVersion {
    if (Test-Command "docker-compose") {
        $version = docker-compose --version
        return ($version -split ' ')[2].TrimEnd(',')
    } elseif (Test-Command "docker") {
        try {
            $version = docker compose version --short
            return $version
        } catch {
            return $null
        }
    }
    return $null
}

function Get-GitVersion {
    if (Test-Command "git") {
        $version = git --version
        return ($version -split ' ')[2]
    }
    return $null
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

function Get-DiskSpace {
    try {
        $drive = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        $freeSpaceGB = [math]::Round($drive.FreeSpace / 1GB, 1)
        return $freeSpaceGB
    } catch {
        return 0
    }
}

function Get-TotalMemory {
    try {
        $memory = Get-WmiObject -Class Win32_ComputerSystem
        $totalMemoryGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 0)
        return $totalMemoryGB
    } catch {
        return 0
    }
}

Write-Host "========================================" -ForegroundColor $Blue
Write-Host "  VirtualDoc Environment Requirements  " -ForegroundColor $Blue
Write-Host "========================================" -ForegroundColor $Blue
Write-Host ""

Write-Info "Detected OS: Windows (PowerShell)"
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..."
$nodeVersion = Get-NodeVersion
if ($nodeVersion) {
    $nodeMajor = [int]($nodeVersion -split '\.')[0]
    if ($nodeMajor -ge 18) {
        Write-Status "Node.js $nodeVersion (>= 18.0.0 required)" $true
    } else {
        Write-Status "Node.js $nodeVersion (>= 18.0.0 required)" $false
        Write-Host "Please upgrade Node.js to version 18 or higher" -ForegroundColor $Red
        Write-Info "Installation instructions:"
        Write-Host "  • Download from: https://nodejs.org/"
        Write-Host "  • Or use nvm: nvm install 18 && nvm use 18"
        if (-not $SkipPause) { Read-Host "Press Enter to continue" }
        exit 1
    }
} else {
    Write-Status "Node.js (>= 18.0.0 required)" $false
    Write-Host "Node.js is not installed. Please install Node.js 18 or higher" -ForegroundColor $Red
    Write-Info "Installation instructions:"
    Write-Host "  • Download from: https://nodejs.org/"
    Write-Host "  • Or use nvm: nvm install 18 && nvm use 18"
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check npm
Write-Host "Checking npm..."
$npmVersion = Get-NpmVersion
if ($npmVersion) {
    Write-Status "npm $npmVersion" $true
} else {
    Write-Status "npm" $false
    Write-Host "npm is not installed" -ForegroundColor $Red
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check Docker
Write-Host "Checking Docker..."
$dockerVersion = Get-DockerVersion
if ($dockerVersion) {
    Write-Status "Docker $dockerVersion" $true
    
    # Check if Docker daemon is running
    try {
        docker info | Out-Null
        Write-Status "Docker daemon is running" $true
    } catch {
        Write-Status "Docker daemon is running" $false
        Write-Host "Docker daemon is not running. Please start Docker" -ForegroundColor $Red
        Write-Info "Start Docker:"
        Write-Host "  • Start Docker Desktop"
        if (-not $SkipPause) { Read-Host "Press Enter to continue" }
        exit 1
    }
} else {
    Write-Status "Docker" $false
    Write-Host "Docker is not installed. Please install Docker" -ForegroundColor $Red
    Write-Info "Installation instructions:"
    Write-Host "  • Download Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check Docker Compose
Write-Host "Checking Docker Compose..."
$composeVersion = Get-DockerComposeVersion
if ($composeVersion) {
    Write-Status "Docker Compose $composeVersion" $true
} else {
    Write-Status "Docker Compose" $false
    Write-Host "Docker Compose is not installed. Please install Docker Compose" -ForegroundColor $Red
    Write-Info "Installation instructions:"
    Write-Host "  • Docker Compose is included with Docker Desktop"
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check Git
Write-Host "Checking Git..."
$gitVersion = Get-GitVersion
if ($gitVersion) {
    Write-Status "Git $gitVersion" $true
} else {
    Write-Status "Git" $false
    Write-Host "Git is not installed. Please install Git" -ForegroundColor $Red
    Write-Info "Installation instructions:"
    Write-Host "  • Download from: https://git-scm.com/download/win"
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check PostgreSQL (optional for development)
Write-Host "Checking PostgreSQL..."
if (Test-Command "psql") {
    $psqlVersion = (psql --version) -split ' ' | Select-Object -Index 2
    Write-Status "PostgreSQL $psqlVersion (optional)" $true
} else {
    Write-Warning "PostgreSQL not found (will use Docker container)"
}

# Check Redis (optional for development)
Write-Host "Checking Redis..."
if (Test-Command "redis-cli") {
    $redisVersion = (redis-cli --version) -split ' ' | Select-Object -Index 1
    Write-Status "Redis $redisVersion (optional)" $true
} else {
    Write-Warning "Redis not found (will use Docker container)"
}

# Check curl
Write-Host "Checking curl..."
if (Test-Command "curl") {
    $curlVersion = (curl --version) -split ' ' | Select-Object -Index 1
    Write-Status "curl $curlVersion" $true
} else {
    Write-Status "curl" $false
    Write-Host "curl is not installed. Please install curl" -ForegroundColor $Red
    Write-Info "Installation instructions:"
    Write-Host "  • Download from: https://curl.se/download.html"
    Write-Host "  • Or install Git Bash which includes curl"
    if (-not $SkipPause) { Read-Host "Press Enter to continue" }
    exit 1
}

# Check jq (optional)
Write-Host "Checking jq..."
if (Test-Command "jq") {
    $jqVersion = (jq --version) -split '-' | Select-Object -Index 1
    Write-Status "jq $jqVersion (optional)" $true
} else {
    Write-Warning "jq not found (optional, used for JSON processing)"
    Write-Info "Installation instructions:"
    Write-Host "  • Download from: https://stedolan.github.io/jq/download/"
}

# Check available ports
Write-Host "Checking required ports..."
$requiredPorts = @(3000, 3001, 3002, 3003, 3004, 5432, 6379, 9200)
$portConflicts = @()

foreach ($port in $requiredPorts) {
    if (Test-Port $port) {
        $portConflicts += $port
    }
}

if ($portConflicts.Count -eq 0) {
    Write-Status "All required ports are available" $true
} else {
    Write-Warning "Some ports are in use: $($portConflicts -join ', ')"
    Write-Info "This might cause conflicts. Consider stopping services using these ports."
}

# Check disk space
Write-Host "Checking disk space..."
$freeSpace = Get-DiskSpace
if ($freeSpace -ge 5) {
    Write-Status "Disk space: ${freeSpace}G available (>= 5G required)" $true
} else {
    Write-Warning "Low disk space: ${freeSpace}G available (>= 5G recommended)"
}

# Check memory
Write-Host "Checking system memory..."
$totalMemory = Get-TotalMemory
if ($totalMemory -ge 4) {
    Write-Status "System memory: ${totalMemory}G (>= 4G recommended)" $true
} else {
    Write-Warning "Low system memory: ${totalMemory}G (>= 4G recommended)"
}

# Windows-specific recommendations
Write-Host ""
Write-Info "Windows-Specific Recommendations:"
Write-Host "  • Consider using WSL2 for better Linux compatibility"
Write-Host "  • Install Git Bash for Unix-like commands"
Write-Host "  • Consider using nvm for Node.js version management"
Write-Host "  • Enable Windows Subsystem for Linux (WSL) for better development experience"
Write-Host "  • Install PowerShell 7+ for better cross-platform compatibility"

Write-Host ""
Write-Host "========================================" -ForegroundColor $Green
Write-Host "  All requirements check completed!   " -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Green
Write-Host ""
Write-Info "You can now run:"
Write-Host "  Windows: .\scripts\setup\install-dependencies.bat"
Write-Host "  PowerShell: .\scripts\setup\install-dependencies.ps1"
Write-Host "  Or Git Bash: ./scripts/setup/install-dependencies.sh"
Write-Host ""
Write-Info "Then run:"
Write-Host "  Windows: .\scripts\setup\setup-environment.bat"
Write-Host "  PowerShell: .\scripts\setup\setup-environment.ps1"
Write-Host "  Or Git Bash: ./scripts/setup/setup-environment.sh"

if (-not $SkipPause) { Read-Host "Press Enter to continue" }
