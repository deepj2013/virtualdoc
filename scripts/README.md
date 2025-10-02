# VirtualDoc - Cross-Platform Development Scripts

## 🎯 Overview

This directory contains cross-platform scripts for setting up and running the VirtualDoc development environment on **macOS**, **Linux**, and **Windows**.

## 🖥️ Supported Operating Systems

- **macOS** (Darwin)
- **Linux** (Ubuntu, CentOS, RHEL, etc.)
- **Windows** (Command Prompt, PowerShell, WSL, Git Bash)

## 📁 Script Structure

```
scripts/
├── setup/                          # Environment setup scripts
│   ├── check-requirements.sh      # Cross-platform requirements checker
│   ├── check-requirements.bat     # Windows batch requirements checker
│   ├── check-requirements.ps1     # Windows PowerShell requirements checker
│   ├── install-dependencies.sh    # Cross-platform dependency installer
│   ├── install-dependencies.bat   # Windows batch dependency installer
│   ├── install-dependencies.ps1   # Windows PowerShell dependency installer
│   ├── setup-environment.sh       # Cross-platform environment setup
│   ├── setup-environment.bat     # Windows batch environment setup
│   ├── setup-environment.ps1     # Windows PowerShell environment setup
│   ├── setup-database.sh         # Cross-platform database setup
│   ├── setup-database.bat        # Windows batch database setup
│   └── setup-database.ps1        # Windows PowerShell database setup
├── dev/                           # Development environment scripts
│   ├── start-dev.sh              # Cross-platform development startup
│   ├── start-dev.bat             # Windows batch development startup
│   ├── start-dev.ps1             # Windows PowerShell development startup
│   ├── monitor-services.sh       # Cross-platform service monitor
│   ├── monitor-services.bat      # Windows batch service monitor
│   ├── restart-services.sh       # Cross-platform service restart
│   ├── restart-services.bat      # Windows batch service restart
│   ├── stop-services.sh           # Cross-platform service stop
│   └── stop-services.bat          # Windows batch service stop
├── staging/                       # Staging environment scripts
│   ├── start-staging.sh          # Cross-platform staging startup
│   ├── start-staging.bat         # Windows batch staging startup
│   ├── start-staging.ps1         # Windows PowerShell staging startup
│   ├── monitor-staging.sh        # Cross-platform staging monitor
│   ├── monitor-staging.bat       # Windows batch staging monitor
│   ├── restart-staging.sh        # Cross-platform staging restart
│   ├── restart-staging.bat      # Windows batch staging restart
│   ├── stop-staging.sh           # Cross-platform staging stop
│   └── stop-staging.bat          # Windows batch staging stop
├── production/                    # Production environment scripts
│   ├── start-production.sh       # Cross-platform production startup
│   ├── start-production.bat      # Windows batch production startup
│   ├── start-production.ps1     # Windows PowerShell production startup
│   ├── monitor-production.sh     # Cross-platform production monitor
│   ├── monitor-production.bat    # Windows batch production monitor
│   ├── restart-production.sh     # Cross-platform production restart
│   ├── restart-production.bat   # Windows batch production restart
│   ├── stop-production.sh        # Cross-platform production stop
│   └── stop-production.bat       # Windows batch production stop
└── maintenance/                   # Maintenance scripts
    ├── backup-database.sh        # Cross-platform database backup
    ├── backup-database.bat       # Windows batch database backup
    ├── restore-database.sh       # Cross-platform database restore
    ├── restore-database.bat      # Windows batch database restore
    ├── health-check.sh           # Cross-platform health check
    ├── health-check.bat          # Windows batch health check
    ├── monitor-database.sh       # Cross-platform database monitor
    └── monitor-database.bat     # Windows batch database monitor
```

## 🚀 Quick Start

### For macOS/Linux/WSL/Git Bash

```bash
# 1. Check requirements
./scripts/setup/check-requirements.sh

# 2. Install dependencies
./scripts/setup/install-dependencies.sh

# 3. Setup environment
./scripts/setup/setup-environment.sh

# 4. Setup database
./scripts/setup/setup-database.sh

# 5. Start development environment
./scripts/dev/start-dev.sh
```

### For Windows Command Prompt

```cmd
REM 1. Check requirements
.\scripts\setup\check-requirements.bat

REM 2. Install dependencies
.\scripts\setup\install-dependencies.bat

REM 3. Setup environment
.\scripts\setup\setup-environment.bat

REM 4. Setup database
.\scripts\setup\setup-database.bat

REM 5. Start development environment
.\scripts\dev\start-dev.bat
```

### For Windows PowerShell

```powershell
# 1. Check requirements
.\scripts\setup\check-requirements.ps1

# 2. Install dependencies
.\scripts\setup\install-dependencies.ps1

# 3. Setup environment
.\scripts\setup\setup-environment.ps1

# 4. Setup database
.\scripts\setup\setup-database.ps1

# 5. Start development environment
.\scripts\dev\start-dev.ps1
```

## 📋 Requirements

### Minimum System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Docker**: 20.10.0 or higher
- **Docker Compose**: 2.0.0 or higher
- **Git**: 2.30.0 or higher
- **Memory**: 4GB RAM minimum (8GB recommended)
- **Disk Space**: 5GB free space minimum (10GB recommended)

### OS-Specific Requirements

#### macOS
- macOS 10.15 (Catalina) or higher
- Xcode Command Line Tools
- Homebrew (recommended)

#### Linux
- Ubuntu 18.04+ / CentOS 7+ / RHEL 7+
- curl, wget, unzip
- build-essential (Ubuntu) or Development Tools (CentOS/RHEL)

#### Windows
- Windows 10 version 1903 or higher
- Windows Subsystem for Linux (WSL2) recommended
- Git Bash or PowerShell 5.1+
- Docker Desktop for Windows

## 🛠️ Script Functions

### Setup Scripts

#### `check-requirements.*`
- Checks if all required software is installed
- Verifies versions meet minimum requirements
- Checks port availability
- Provides installation instructions for missing software
- Cross-platform compatibility checks

#### `install-dependencies.*`
- Installs all npm dependencies for all services
- Installs global development tools
- Pulls required Docker images
- Creates environment files
- Sets up Git hooks
- Creates shared library symlinks

#### `setup-environment.*`
- Creates environment-specific configuration files
- Generates secure random secrets
- Creates Docker Compose override files
- Sets up PM2 ecosystem configuration
- Creates database initialization scripts

#### `setup-database.*`
- Starts PostgreSQL container
- Creates databases for all environments
- Runs database migrations
- Seeds development database
- Creates backup and restore scripts

### Development Scripts

#### `start-dev.*`
- Starts all infrastructure services (PostgreSQL, Redis, Elasticsearch, Nginx)
- Runs database migrations
- Starts all backend services
- Starts all frontend services
- Performs health checks
- Creates monitoring scripts

#### `monitor-services.*`
- Shows status of all services
- Displays port usage
- Shows Docker container status
- Provides OS-specific information

#### `restart-services.*`
- Gracefully stops all services
- Restarts the development environment
- Preserves data and configuration

#### `stop-services.*`
- Stops all application services
- Stops infrastructure services
- Cleans up temporary files

### Staging Scripts

#### `start-staging.*`
- Starts staging environment with production-like configuration
- Uses PM2 for process management
- Enables security features
- Sets up monitoring and logging

#### `monitor-staging.*`
- Monitors staging environment health
- Shows PM2 process status
- Displays infrastructure status
- Provides performance metrics

### Production Scripts

#### `start-production.*`
- Starts production environment with full security
- Enables SSL/TLS encryption
- Sets up process clustering
- Configures monitoring and alerting
- Creates backup schedules

#### `monitor-production.*`
- Comprehensive production monitoring
- System resource monitoring
- Service health checks
- Security status monitoring
- Performance metrics

### Maintenance Scripts

#### `backup-database.*`
- Creates database backups for all environments
- Compresses and stores backups
- Manages backup retention
- Schedules automatic backups

#### `restore-database.*`
- Restores database from backup
- Validates backup integrity
- Supports environment-specific restores
- Provides rollback capabilities

#### `health-check.*`
- Comprehensive system health checks
- Database connectivity tests
- Service availability checks
- Performance validation

## 🔧 Configuration

### Environment Variables

The scripts automatically create environment files for each tier:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

### Docker Compose Overrides

- `docker-compose.override.yml` - Development overrides
- `docker-compose.staging.yml` - Staging overrides
- `docker-compose.prod.yml` - Production overrides

### PM2 Configuration

- `ecosystem.config.js` - PM2 process configuration
- Supports clustering and load balancing
- Environment-specific settings

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process on port
kill -9 $(lsof -ti :3000)  # macOS/Linux
taskkill /F /PID <PID>  # Windows
```

#### Docker Issues
```bash
# Restart Docker
sudo systemctl restart docker  # Linux
# Restart Docker Desktop  # macOS/Windows

# Clean up Docker
docker system prune -a
```

#### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Windows-Specific Issues
- Enable WSL2 for better Linux compatibility
- Use PowerShell as Administrator for global installations
- Ensure Docker Desktop is running
- Check Windows Defender exclusions

### Getting Help

1. **Check logs**: `tail -f logs/[service-name].log`
2. **Monitor services**: `./scripts/dev/monitor-services.sh`
3. **Restart services**: `./scripts/dev/restart-services.sh`
4. **Health check**: `./scripts/maintenance/health-check.sh`

## 📚 Additional Resources

### Documentation
- [Project Overview](../project-docs/PROJECT_OVERVIEW.md)
- [Technical Architecture](../project-docs/architecture/system-architecture.md)
- [Database Schema](../project-docs/diagrams/database-schema.md)
- [User Stories](../project-docs/flows/user-stories.md)

### External Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

When adding new scripts:

1. Create versions for all platforms (.sh, .bat, .ps1)
2. Follow the existing naming conventions
3. Include proper error handling
4. Add cross-platform compatibility
5. Update this README with new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
