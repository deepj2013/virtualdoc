# Docker Rebuild Guide

## Problem: Seeing Old Code After Updates

When you make code changes, Docker may use cached layers from previous builds, causing you to see old code in running containers. This guide explains how to ensure you see your latest changes.

## Quick Solutions

### Option 1: Rebuild Without Cache (Recommended for Development)

Rebuild all services without using cache:

```bash
docker-compose build --no-cache
docker-compose up -d
```

Or rebuild a specific service:

```bash
docker-compose build --no-cache user-service
docker-compose up -d user-service
```

### Option 2: Force Rebuild and Recreate Containers

Stop, rebuild, and restart services:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Option 3: Remove Images and Rebuild

Completely remove old images and rebuild:

```bash
# Stop and remove containers
docker-compose down

# Remove specific service image
docker rmi virtualdoc-user-service:latest

# Or remove all project images
docker images | grep virtualdoc | awk '{print $3}' | xargs docker rmi

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Option 4: Clean Everything and Start Fresh

Nuclear option - removes all containers, images, and volumes:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## Understanding Docker Caching

Docker caches layers to speed up builds. When you change code:

1. **If you change code after `COPY . .`**: Docker may use cached layers
2. **If you change `package.json`**: Docker will rebuild from that point
3. **If you change Dockerfile**: Docker will rebuild from that point

## Best Practices

### During Development

1. **Use `--no-cache` flag** when you want to ensure fresh builds:
   ```bash
   docker-compose build --no-cache user-service
   ```

2. **Restart containers** after code changes:
   ```bash
   docker-compose restart user-service
   ```

3. **Watch logs** to verify changes:
   ```bash
   docker-compose logs -f user-service
   ```

### Check What's Running

1. **View running containers**:
   ```bash
   docker-compose ps
   ```

2. **Inspect container**:
   ```bash
   docker exec -it virtualdoc-user-service sh
   ```

3. **Check file timestamps** inside container:
   ```bash
   docker exec virtualdoc-user-service ls -la /app/dist/
   ```

## Service-Specific Rebuilds

### Rebuild User Service Only

```bash
docker-compose build --no-cache user-service
docker-compose up -d user-service
docker-compose logs -f user-service
```

### Rebuild Auth Service Only

```bash
docker-compose build --no-cache auth-service
docker-compose up -d auth-service
docker-compose logs -f auth-service
```

### Rebuild Frontend Only

```bash
docker-compose build --no-cache web-app
docker-compose up -d web-app
docker-compose logs -f web-app
```

## Troubleshooting

### Still seeing old code?

1. **Verify the build succeeded**:
   ```bash
   docker-compose build user-service
   ```
   Look for errors in the build output.

2. **Check if container is using old image**:
   ```bash
   docker-compose ps
   docker images | grep virtualdoc-user-service
   ```

3. **Force recreate container**:
   ```bash
   docker-compose up -d --force-recreate user-service
   ```

4. **Check container logs**:
   ```bash
   docker-compose logs user-service
   ```

### Build Errors

If you get build errors:

1. **Check TypeScript compilation**:
   ```bash
   cd backend/services/user-service
   npm run build
   ```

2. **Install dependencies locally first**:
   ```bash
   npm install
   ```

3. **Verify Dockerfile** is correct

## Quick Reference Commands

```bash
# Rebuild everything without cache
docker-compose build --no-cache && docker-compose up -d

# Rebuild specific service
docker-compose build --no-cache <service-name> && docker-compose up -d <service-name>

# View logs
docker-compose logs -f <service-name>

# Restart service
docker-compose restart <service-name>

# Stop everything
docker-compose down

# Clean rebuild (removes containers)
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# Nuclear option (removes everything including volumes)
docker-compose down -v && docker-compose build --no-cache && docker-compose up -d
```

## Service Names

- `auth-service` - Authentication service
- `user-service` - User management service
- `patient-service` - Patient management service
- `appointment-service` - Appointment service
- `web-app` - Frontend application
- `postgres` - Database
- `redis` - Cache

## Notes

- Using `--no-cache` will make builds slower but ensures fresh code
- During active development, consider using `docker-compose restart` for quick changes
- Always check logs after rebuilding to ensure services started correctly
- Database and Redis containers usually don't need rebuilding unless schema changes




