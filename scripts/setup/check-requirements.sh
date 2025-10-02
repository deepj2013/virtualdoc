#!/bin/bash

# VirtualDoc - Cross-Platform Development Environment Requirements Checker
# This script checks if all required software is installed on macOS, Linux, and Windows (WSL/Git Bash)

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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get Node.js version
get_node_version() {
    if command_exists node; then
        node --version | sed 's/v//'
    else
        echo ""
    fi
}

# Function to get npm version
get_npm_version() {
    if command_exists npm; then
        npm --version
    else
        echo ""
    fi
}

# Function to get Docker version
get_docker_version() {
    if command_exists docker; then
        docker --version | cut -d' ' -f3 | cut -d',' -f1
    else
        echo ""
    fi
}

# Function to get Docker Compose version
get_compose_version() {
    if command_exists docker-compose; then
        docker-compose --version | cut -d' ' -f3 | cut -d',' -f1
    elif docker compose version &> /dev/null; then
        docker compose version --short
    else
        echo ""
    fi
}

# Function to get Git version
get_git_version() {
    if command_exists git; then
        git --version | cut -d' ' -f3
    else
        echo ""
    fi
}

# Function to check port availability (cross-platform)
check_port() {
    local port=$1
    if command_exists lsof; then
        lsof -i :$port &> /dev/null
    elif command_exists netstat; then
        netstat -an | grep -q ":$port "
    else
        # Fallback - assume port is available
        return 0
    fi
}

# Function to get available disk space
get_disk_space() {
    if command_exists df; then
        if [[ "$OS" == "macos" ]]; then
            df -h . | awk 'NR==2 {print $4}' | sed 's/Gi//'
        else
            df -h . | awk 'NR==2 {print $4}' | sed 's/G//'
        fi
    else
        echo "0"
    fi
}

# Function to get total memory
get_total_memory() {
    if command_exists free; then
        free -g | awk 'NR==2{print $2}'
    elif [[ "$OS" == "macos" ]] && command_exists sysctl; then
        sysctl -n hw.memsize | awk '{print int($0/1024/1024/1024)}'
    else
        echo "0"
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc Environment Requirements  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Detect OS
detect_os

# Check Node.js
echo "Checking Node.js..."
NODE_VERSION=$(get_node_version)
if [ ! -z "$NODE_VERSION" ]; then
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ $NODE_MAJOR_VERSION -ge 18 ]; then
        print_status "Node.js $NODE_VERSION (>= 18.0.0 required)" 0
    else
        print_status "Node.js $NODE_VERSION (>= 18.0.0 required)" 1
        echo -e "${RED}Please upgrade Node.js to version 18 or higher${NC}"
        echo -e "${BLUE}Installation instructions:${NC}"
        if [[ "$OS" == "macos" ]]; then
            echo "  • Using Homebrew: brew install node@18"
            echo "  • Using nvm: nvm install 18 && nvm use 18"
            echo "  • Download from: https://nodejs.org/"
        elif [[ "$OS" == "linux" ]]; then
            echo "  • Using apt: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
            echo "  • Using yum: curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs"
            echo "  • Using nvm: nvm install 18 && nvm use 18"
        else
            echo "  • Download from: https://nodejs.org/"
            echo "  • Or use nvm: nvm install 18 && nvm use 18"
        fi
        exit 1
    fi
else
    print_status "Node.js (>= 18.0.0 required)" 1
    echo -e "${RED}Node.js is not installed. Please install Node.js 18 or higher${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • Using Homebrew: brew install node@18"
        echo "  • Using nvm: nvm install 18 && nvm use 18"
        echo "  • Download from: https://nodejs.org/"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • Using apt: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        echo "  • Using yum: curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo yum install -y nodejs"
        echo "  • Using nvm: nvm install 18 && nvm use 18"
    else
        echo "  • Download from: https://nodejs.org/"
        echo "  • Or use nvm: nvm install 18 && nvm use 18"
    fi
    exit 1
fi

# Check npm
echo "Checking npm..."
NPM_VERSION=$(get_npm_version)
if [ ! -z "$NPM_VERSION" ]; then
    print_status "npm $NPM_VERSION" 0
else
    print_status "npm" 1
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

# Check Docker
echo "Checking Docker..."
DOCKER_VERSION=$(get_docker_version)
if [ ! -z "$DOCKER_VERSION" ]; then
    print_status "Docker $DOCKER_VERSION" 0
    
    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        print_status "Docker daemon is running" 0
    else
        print_status "Docker daemon is running" 1
        echo -e "${RED}Docker daemon is not running. Please start Docker${NC}"
        echo -e "${BLUE}Start Docker:${NC}"
        if [[ "$OS" == "macos" ]]; then
            echo "  • Open Docker Desktop application"
            echo "  • Or run: open -a Docker"
        elif [[ "$OS" == "linux" ]]; then
            echo "  • sudo systemctl start docker"
            echo "  • sudo service docker start"
        else
            echo "  • Start Docker Desktop"
        fi
        exit 1
    fi
else
    print_status "Docker" 1
    echo -e "${RED}Docker is not installed. Please install Docker${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • Download Docker Desktop from: https://www.docker.com/products/docker-desktop/"
        echo "  • Or using Homebrew: brew install --cask docker"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • Ubuntu/Debian: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        echo "  • CentOS/RHEL: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
        echo "  • Or follow: https://docs.docker.com/engine/install/"
    else
        echo "  • Download Docker Desktop from: https://www.docker.com/products/docker-desktop/"
    fi
    exit 1
fi

# Check Docker Compose
echo "Checking Docker Compose..."
COMPOSE_VERSION=$(get_compose_version)
if [ ! -z "$COMPOSE_VERSION" ]; then
    print_status "Docker Compose $COMPOSE_VERSION" 0
else
    print_status "Docker Compose" 1
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • Docker Compose is included with Docker Desktop"
        echo "  • Or using Homebrew: brew install docker-compose"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
        echo "  • sudo chmod +x /usr/local/bin/docker-compose"
    else
        echo "  • Docker Compose is included with Docker Desktop"
    fi
    exit 1
fi

# Check Git
echo "Checking Git..."
GIT_VERSION=$(get_git_version)
if [ ! -z "$GIT_VERSION" ]; then
    print_status "Git $GIT_VERSION" 0
else
    print_status "Git" 1
    echo -e "${RED}Git is not installed. Please install Git${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • Using Homebrew: brew install git"
        echo "  • Download from: https://git-scm.com/download/mac"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • Ubuntu/Debian: sudo apt-get install git"
        echo "  • CentOS/RHEL: sudo yum install git"
        echo "  • Or: sudo dnf install git"
    else
        echo "  • Download from: https://git-scm.com/download/win"
    fi
    exit 1
fi

# Check PostgreSQL (optional for development)
echo "Checking PostgreSQL..."
if command_exists psql; then
    PSQL_VERSION=$(psql --version | cut -d' ' -f3)
    print_status "PostgreSQL $PSQL_VERSION (optional)" 0
else
    print_warning "PostgreSQL not found (will use Docker container)"
fi

# Check Redis (optional for development)
echo "Checking Redis..."
if command_exists redis-cli; then
    REDIS_VERSION=$(redis-cli --version | cut -d' ' -f2)
    print_status "Redis $REDIS_VERSION (optional)" 0
else
    print_warning "Redis not found (will use Docker container)"
fi

# Check curl
echo "Checking curl..."
if command_exists curl; then
    CURL_VERSION=$(curl --version | head -n1 | cut -d' ' -f2)
    print_status "curl $CURL_VERSION" 0
else
    print_status "curl" 1
    echo -e "${RED}curl is not installed. Please install curl${NC}"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • curl is usually pre-installed on macOS"
        echo "  • Using Homebrew: brew install curl"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • Ubuntu/Debian: sudo apt-get install curl"
        echo "  • CentOS/RHEL: sudo yum install curl"
    else
        echo "  • Download from: https://curl.se/download.html"
    fi
    exit 1
fi

# Check jq (optional)
echo "Checking jq..."
if command_exists jq; then
    JQ_VERSION=$(jq --version | cut -d'-' -f2)
    print_status "jq $JQ_VERSION (optional)" 0
else
    print_warning "jq not found (optional, used for JSON processing)"
    echo -e "${BLUE}Installation instructions:${NC}"
    if [[ "$OS" == "macos" ]]; then
        echo "  • Using Homebrew: brew install jq"
    elif [[ "$OS" == "linux" ]]; then
        echo "  • Ubuntu/Debian: sudo apt-get install jq"
        echo "  • CentOS/RHEL: sudo yum install jq"
    else
        echo "  • Download from: https://stedolan.github.io/jq/download/"
    fi
fi

# Check available ports
echo "Checking required ports..."
REQUIRED_PORTS=(3000 3001 3002 3003 3004 5432 6379 9200)
PORT_CONFLICTS=()

for port in "${REQUIRED_PORTS[@]}"; do
    if check_port $port; then
        PORT_CONFLICTS+=($port)
    fi
done

if [ ${#PORT_CONFLICTS[@]} -eq 0 ]; then
    print_status "All required ports are available" 0
else
    print_warning "Some ports are in use: ${PORT_CONFLICTS[*]}"
    print_info "This might cause conflicts. Consider stopping services using these ports."
fi

# Check disk space
echo "Checking disk space..."
AVAILABLE_SPACE=$(get_disk_space)
if [ ${AVAILABLE_SPACE%.*} -ge 5 ]; then
    print_status "Disk space: ${AVAILABLE_SPACE}G available (>= 5G required)" 0
else
    print_warning "Low disk space: ${AVAILABLE_SPACE}G available (>= 5G recommended)"
fi

# Check memory
echo "Checking system memory..."
TOTAL_MEMORY=$(get_total_memory)
if [ $TOTAL_MEMORY -ge 4 ]; then
    print_status "System memory: ${TOTAL_MEMORY}G (>= 4G recommended)" 0
else
    print_warning "Low system memory: ${TOTAL_MEMORY}G (>= 4G recommended)"
fi

# OS-specific recommendations
echo ""
echo -e "${BLUE}OS-Specific Recommendations:${NC}"
if [[ "$OS" == "macos" ]]; then
    echo "  • Install Homebrew if not already installed: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  • Consider installing nvm for Node.js version management: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
elif [[ "$OS" == "linux" ]]; then
    echo "  • Update package manager: sudo apt update (Ubuntu/Debian) or sudo yum update (CentOS/RHEL)"
    echo "  • Consider installing nvm for Node.js version management: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
else
    echo "  • Consider using WSL2 for better Linux compatibility"
    echo "  • Install Git Bash for Unix-like commands"
    echo "  • Consider using nvm for Node.js version management"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All requirements check completed!   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "You can now run:"
if [[ "$OS" == "windows" ]]; then
    print_info "  Windows: .\\scripts\\setup\\install-dependencies.bat"
    print_info "  Or Git Bash: ./scripts/setup/install-dependencies.sh"
else
    print_info "  ./scripts/setup/install-dependencies.sh"
fi
print_info "Then run:"
if [[ "$OS" == "windows" ]]; then
    print_info "  Windows: .\\scripts\\setup\\setup-environment.bat"
    print_info "  Or Git Bash: ./scripts/setup/setup-environment.sh"
else
    print_info "  ./scripts/setup/setup-environment.sh"
fi