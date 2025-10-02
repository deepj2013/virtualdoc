#!/bin/bash

# VirtualDoc - Database Setup Script
# This script sets up databases for all environments

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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  VirtualDoc Database Setup            ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_info "Project root: $PROJECT_ROOT"

# Function to wait for database to be ready
wait_for_db() {
    local db_url=$1
    local max_attempts=30
    local attempt=1
    
    print_info "Waiting for database to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec virtualdoc-postgres pg_isready -U virtualdoc -d virtualdoc_dev &> /dev/null; then
            print_status "Database is ready" 0
            return 0
        fi
        
        print_info "Attempt $attempt/$max_attempts - Database not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_status "Database failed to become ready" 1
    return 1
}

# Start PostgreSQL container
echo ""
echo -e "${BLUE}Starting Database Infrastructure${NC}"
echo "----------------------------------------"

print_info "Starting PostgreSQL container..."
if docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d postgres; then
    print_status "PostgreSQL container started" 0
else
    print_status "Failed to start PostgreSQL container" 1
    exit 1
fi

# Wait for database to be ready
wait_for_db

# Function to create database schema
create_database_schema() {
    local db_name=$1
    local env_name=$2
    
    print_info "Creating schema for $env_name database ($db_name)..."
    
    # Create database if it doesn't exist
    docker exec virtualdoc-postgres psql -U virtualdoc -c "CREATE DATABASE $db_name;" 2>/dev/null || true
    
    # Run schema creation
    if docker exec -i virtualdoc-postgres psql -U virtualdoc -d $db_name < "$PROJECT_ROOT/scripts/setup/init-db.sql"; then
        print_status "$env_name database schema created" 0
    else
        print_status "$env_name database schema creation failed" 1
        return 1
    fi
}

# Create database schemas
echo ""
echo -e "${BLUE}Creating Database Schemas${NC}"
echo "----------------------------------------"

create_database_schema "virtualdoc_dev" "Development"
create_database_schema "virtualdoc_staging" "Staging"
create_database_schema "virtualdoc_prod" "Production"

# Function to run migrations
run_migrations() {
    local env_name=$1
    local db_name=$2
    
    print_info "Running migrations for $env_name..."
    
    # Set environment variables
    export NODE_ENV=$env_name
    export DATABASE_URL="postgresql://virtualdoc:virtualdoc@localhost:5432/$db_name"
    
    # Run migrations for each service
    for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
        if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
            service_name=$(basename "$service_dir")
            
            if [ -f "$service_dir/src/migrations/migrate.js" ]; then
                print_info "Running migrations for $service_name..."
                cd "$service_dir"
                if npm run migrate; then
                    print_status "$service_name migrations completed" 0
                else
                    print_status "$service_name migrations failed" 1
                fi
                cd "$PROJECT_ROOT"
            fi
        fi
    done
}

# Run migrations for each environment
echo ""
echo -e "${BLUE}Running Database Migrations${NC}"
echo "----------------------------------------"

run_migrations "development" "virtualdoc_dev"
run_migrations "staging" "virtualdoc_staging"
run_migrations "production" "virtualdoc_prod"

# Function to seed database
seed_database() {
    local env_name=$1
    local db_name=$2
    
    print_info "Seeding $env_name database..."
    
    # Set environment variables
    export NODE_ENV=$env_name
    export DATABASE_URL="postgresql://virtualdoc:virtualdoc@localhost:5432/$db_name"
    
    # Run seeders for each service
    for service_dir in "$PROJECT_ROOT/backend/common"/* "$PROJECT_ROOT/backend/specific"/*; do
        if [ -d "$service_dir" ] && [ -f "$service_dir/package.json" ]; then
            service_name=$(basename "$service_dir")
            
            if [ -f "$service_dir/src/seeders/seed.js" ]; then
                print_info "Seeding $service_name..."
                cd "$service_dir"
                if npm run seed; then
                    print_status "$service_name seeding completed" 0
                else
                    print_status "$service_name seeding failed" 1
                fi
                cd "$PROJECT_ROOT"
            fi
        fi
    done
}

# Seed databases
echo ""
echo -e "${BLUE}Seeding Databases${NC}"
echo "----------------------------------------"

seed_database "development" "virtualdoc_dev"
seed_database "staging" "virtualdoc_staging"
# Skip production seeding for security
print_warning "Production database seeding skipped for security"

# Create database backup script
echo ""
echo -e "${BLUE}Creating Database Backup Script${NC}"
echo "----------------------------------------"

cat > "$PROJECT_ROOT/scripts/maintenance/backup-database.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Database Backup Script

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Creating database backups..."

# Backup development database
docker exec virtualdoc-postgres pg_dump -U virtualdoc virtualdoc_dev > "$BACKUP_DIR/virtualdoc_dev_$TIMESTAMP.sql"
echo "Development database backup created: virtualdoc_dev_$TIMESTAMP.sql"

# Backup staging database
docker exec virtualdoc-postgres pg_dump -U virtualdoc virtualdoc_staging > "$BACKUP_DIR/virtualdoc_staging_$TIMESTAMP.sql"
echo "Staging database backup created: virtualdoc_staging_$TIMESTAMP.sql"

# Backup production database
docker exec virtualdoc-postgres pg_dump -U virtualdoc virtualdoc_prod > "$BACKUP_DIR/virtualdoc_prod_$TIMESTAMP.sql"
echo "Production database backup created: virtualdoc_prod_$TIMESTAMP.sql"

echo "All database backups completed!"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/backup-database.sh"
print_status "Database backup script created" 0

# Create database restore script
cat > "$PROJECT_ROOT/scripts/maintenance/restore-database.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Database Restore Script

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file> [environment]"
    echo "Example: $0 virtualdoc_dev_20231201_120000.sql development"
    exit 1
fi

BACKUP_FILE=$1
ENVIRONMENT=${2:-development}

case $ENVIRONMENT in
    development)
        DB_NAME="virtualdoc_dev"
        ;;
    staging)
        DB_NAME="virtualdoc_staging"
        ;;
    production)
        DB_NAME="virtualdoc_prod"
        ;;
    *)
        echo "Invalid environment. Use: development, staging, or production"
        exit 1
        ;;
esac

echo "Restoring database $DB_NAME from $BACKUP_FILE..."

# Drop and recreate database
docker exec virtualdoc-postgres psql -U virtualdoc -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec virtualdoc-postgres psql -U virtualdoc -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
docker exec -i virtualdoc-postgres psql -U virtualdoc -d $DB_NAME < "$BACKUP_FILE"

echo "Database restore completed!"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/restore-database.sh"
print_status "Database restore script created" 0

# Create database health check script
cat > "$PROJECT_ROOT/scripts/maintenance/health-check.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Database Health Check Script

set -e

echo "Checking database health..."

# Check PostgreSQL container status
if docker ps | grep -q virtualdoc-postgres; then
    echo "✓ PostgreSQL container is running"
else
    echo "✗ PostgreSQL container is not running"
    exit 1
fi

# Check database connectivity
if docker exec virtualdoc-postgres pg_isready -U virtualdoc; then
    echo "✓ PostgreSQL is accepting connections"
else
    echo "✗ PostgreSQL is not accepting connections"
    exit 1
fi

# Check each database
for db in virtualdoc_dev virtualdoc_staging virtualdoc_prod; do
    if docker exec virtualdoc-postgres psql -U virtualdoc -c "SELECT 1;" $db &> /dev/null; then
        echo "✓ Database $db is accessible"
    else
        echo "✗ Database $db is not accessible"
        exit 1
    fi
done

echo "All database health checks passed!"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/health-check.sh"
print_status "Database health check script created" 0

# Create database monitoring script
cat > "$PROJECT_ROOT/scripts/maintenance/monitor-database.sh" << 'EOF'
#!/bin/bash

# VirtualDoc Database Monitoring Script

echo "Database Monitoring Information"
echo "=============================="

# Database sizes
echo ""
echo "Database Sizes:"
docker exec virtualdoc-postgres psql -U virtualdoc -c "
SELECT 
    datname as database,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database 
WHERE datname LIKE 'virtualdoc_%'
ORDER BY pg_database_size(datname) DESC;
"

# Active connections
echo ""
echo "Active Connections:"
docker exec virtualdoc-postgres psql -U virtualdoc -c "
SELECT 
    datname as database,
    count(*) as connections
FROM pg_stat_activity 
WHERE datname LIKE 'virtualdoc_%'
GROUP BY datname;
"

# Table sizes
echo ""
echo "Largest Tables:"
docker exec virtualdoc-postgres psql -U virtualdoc -d virtualdoc_dev -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"
EOF

chmod +x "$PROJECT_ROOT/scripts/maintenance/monitor-database.sh"
print_status "Database monitoring script created" 0

# Test database connections
echo ""
echo -e "${BLUE}Testing Database Connections${NC}"
echo "----------------------------------------"

# Test development database
if docker exec virtualdoc-postgres psql -U virtualdoc -d virtualdoc_dev -c "SELECT 'Development DB Connected' as status;" &> /dev/null; then
    print_status "Development database connection test passed" 0
else
    print_status "Development database connection test failed" 1
fi

# Test staging database
if docker exec virtualdoc-postgres psql -U virtualdoc -d virtualdoc_staging -c "SELECT 'Staging DB Connected' as status;" &> /dev/null; then
    print_status "Staging database connection test passed" 0
else
    print_status "Staging database connection test failed" 1
fi

# Test production database
if docker exec virtualdoc-postgres psql -U virtualdoc -d virtualdoc_prod -c "SELECT 'Production DB Connected' as status;" &> /dev/null; then
    print_status "Production database connection test passed" 0
else
    print_status "Production database connection test failed" 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Database Setup Complete!             ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
print_info "Databases created:"
print_info "- virtualdoc_dev (Development)"
print_info "- virtualdoc_staging (Staging)"
print_info "- virtualdoc_prod (Production)"
echo ""
print_info "Maintenance scripts created:"
print_info "- ./scripts/maintenance/backup-database.sh"
print_info "- ./scripts/maintenance/restore-database.sh"
print_info "- ./scripts/maintenance/health-check.sh"
print_info "- ./scripts/maintenance/monitor-database.sh"
echo ""
print_info "Next steps:"
print_info "1. Run: ./scripts/dev/start-dev.sh"
print_info "2. Or run: npm run start:dev"
echo ""
print_info "Database connection strings:"
print_info "- Development: postgresql://virtualdoc:virtualdoc@localhost:5432/virtualdoc_dev"
print_info "- Staging: postgresql://virtualdoc:virtualdoc@localhost:5432/virtualdoc_staging"
print_info "- Production: postgresql://virtualdoc:virtualdoc@localhost:5432/virtualdoc_prod"
