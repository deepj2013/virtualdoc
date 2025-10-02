# VirtualDoc - Deployment Guide

## 🚀 Production Deployment

This guide covers deploying VirtualDoc to production environments with high availability, security, and scalability.

## 🏗️ Infrastructure Requirements

### Minimum Production Requirements

#### Compute Resources
- **CPU**: 16 cores (8 for services, 8 for databases)
- **RAM**: 32GB (16GB for services, 16GB for databases)
- **Storage**: 500GB SSD (200GB for databases, 300GB for files)
- **Network**: 1Gbps bandwidth

#### Recommended Production Requirements
- **CPU**: 32 cores (16 for services, 16 for databases)
- **RAM**: 64GB (32GB for services, 32GB for databases)
- **Storage**: 1TB SSD (500GB for databases, 500GB for files)
- **Network**: 10Gbps bandwidth

### Cloud Provider Recommendations

#### AWS
- **EC2**: t3.xlarge for services, r5.xlarge for databases
- **RDS**: PostgreSQL with Multi-AZ deployment
- **ElastiCache**: Redis cluster
- **S3**: File storage
- **CloudFront**: CDN
- **ALB**: Application Load Balancer

#### Google Cloud
- **Compute Engine**: n1-standard-8 for services
- **Cloud SQL**: PostgreSQL with high availability
- **Memorystore**: Redis
- **Cloud Storage**: File storage
- **Cloud CDN**: Content delivery
- **Load Balancer**: Global load balancer

#### Azure
- **Virtual Machines**: Standard_D8s_v3 for services
- **Azure Database**: PostgreSQL with high availability
- **Azure Cache**: Redis
- **Blob Storage**: File storage
- **CDN**: Azure CDN
- **Application Gateway**: Load balancer

## 🐳 Docker Production Setup

### 1. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Database Services
  postgres:
    image: postgres:15-alpine
    container_name: virtualdoc-postgres-prod
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - virtualdoc-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2'
        reservations:
          memory: 2G
          cpus: '1'

  redis:
    image: redis:7-alpine
    container_name: virtualdoc-redis-prod
    volumes:
      - redis_data:/data
    networks:
      - virtualdoc-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1'
        reservations:
          memory: 1G
          cpus: '0.5'

  # Common Services
  auth-service:
    build:
      context: ./backend/common/auth-service
      dockerfile: Dockerfile.prod
    container_name: virtualdoc-auth-service-prod
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    networks:
      - virtualdoc-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '1'
        reservations:
          memory: 512M
          cpus: '0.5'

  # ... other services with similar configuration

  # API Gateway
  nginx:
    image: nginx:alpine
    container_name: virtualdoc-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/conf.d:/etc/nginx/conf.d
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
    networks:
      - virtualdoc-network
    restart: unless-stopped
    depends_on:
      - auth-service
      - user-service
      # ... other services

volumes:
  postgres_data:
  redis_data:

networks:
  virtualdoc-network:
    driver: bridge
```

### 2. Production Dockerfiles

Create `Dockerfile.prod` for each service:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S virtualdoc -u 1001
USER virtualdoc

EXPOSE 3001
CMD ["npm", "start"]
```

## ☸️ Kubernetes Deployment

### 1. Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: virtualdoc
  labels:
    name: virtualdoc
```

### 2. ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: virtualdoc-config
  namespace: virtualdoc
data:
  NODE_ENV: "production"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/virtualdoc"
  REDIS_URL: "redis://redis:6379"
  JWT_SECRET: "your-jwt-secret"
  JWT_REFRESH_SECRET: "your-refresh-secret"
```

### 3. Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: virtualdoc-secrets
  namespace: virtualdoc
type: Opaque
data:
  postgres-password: <base64-encoded-password>
  redis-password: <base64-encoded-password>
  jwt-secret: <base64-encoded-secret>
  jwt-refresh-secret: <base64-encoded-secret>
```

### 4. Database Deployment

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: virtualdoc
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: virtualdoc
        - name: POSTGRES_USER
          value: virtualdoc
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: virtualdoc-secrets
              key: postgres-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: virtualdoc
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```

### 5. Service Deployment

```yaml
# k8s/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: virtualdoc
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: virtualdoc/auth-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: virtualdoc-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: virtualdoc-config
              key: DATABASE_URL
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: virtualdoc
spec:
  selector:
    app: auth-service
  ports:
  - port: 3001
    targetPort: 3001
```

### 6. Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: virtualdoc-ingress
  namespace: virtualdoc
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - api.virtualdoc.health
    - app.virtualdoc.health
    secretName: virtualdoc-tls
  rules:
  - host: api.virtualdoc.health
    http:
      paths:
      - path: /api/auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 3001
      - path: /api/users
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 3002
  - host: app.virtualdoc.health
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app
            port:
              number: 3000
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

#### Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d api.virtualdoc.health -d app.virtualdoc.health

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Self-signed Certificate (Development)

```bash
# Generate private key
openssl genrsa -out virtualdoc.key 2048

# Generate certificate
openssl req -new -x509 -key virtualdoc.key -out virtualdoc.crt -days 365

# Move to nginx directory
sudo mv virtualdoc.key virtualdoc.crt /etc/nginx/ssl/
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000:4000/tcp  # Block direct access to services
```

### 3. Database Security

```sql
-- Create dedicated database user
CREATE USER virtualdoc_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE virtualdoc TO virtualdoc_app;
GRANT USAGE ON SCHEMA public TO virtualdoc_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO virtualdoc_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO virtualdoc_app;

-- Enable SSL
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
```

## 📊 Monitoring and Logging

### 1. Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'virtualdoc-services'
    static_configs:
      - targets: ['auth-service:3001', 'user-service:3002', 'patient-service:4001']
    metrics_path: /metrics
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### 2. Grafana Dashboard

```json
{
  "dashboard": {
    "title": "VirtualDoc Services",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"virtualdoc-services\"}",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{instance}}"
          }
        ]
      }
    ]
  }
}
```

### 3. Log Aggregation

```yaml
# monitoring/fluentd.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: virtualdoc
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*virtualdoc*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
    </source>
    
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.virtualdoc.svc.cluster.local
      port 9200
      index_name virtualdoc-logs
    </match>
```

## 🚀 CI/CD Pipeline

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t virtualdoc/auth-service:latest ./backend/common/auth-service
          docker build -t virtualdoc/user-service:latest ./backend/common/user-service
          # ... build other services
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push virtualdoc/auth-service:latest
          docker push virtualdoc/user-service:latest
          # ... push other services

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl rollout restart deployment/auth-service
          kubectl rollout restart deployment/user-service
          # ... restart other services
```

### 2. Docker Registry

```bash
# Build and push images
docker build -t your-registry/virtualdoc/auth-service:latest ./backend/common/auth-service
docker push your-registry/virtualdoc/auth-service:latest

# Update Kubernetes deployments
kubectl set image deployment/auth-service auth-service=your-registry/virtualdoc/auth-service:latest
```

## 🔄 Backup and Recovery

### 1. Database Backup

```bash
#!/bin/bash
# backup-database.sh

# Create backup directory
mkdir -p /backups/postgres/$(date +%Y%m%d)

# Backup database
docker exec virtualdoc-postgres-prod pg_dump -U virtualdoc virtualdoc > /backups/postgres/$(date +%Y%m%d)/virtualdoc_$(date +%H%M%S).sql

# Compress backup
gzip /backups/postgres/$(date +%Y%m%d)/virtualdoc_$(date +%H%M%S).sql

# Upload to S3
aws s3 cp /backups/postgres/$(date +%Y%m%d)/virtualdoc_$(date +%H%M%S).sql.gz s3://virtualdoc-backups/postgres/

# Cleanup old backups (keep 30 days)
find /backups/postgres -type d -mtime +30 -exec rm -rf {} \;
```

### 2. File Storage Backup

```bash
#!/bin/bash
# backup-files.sh

# Sync files to S3
aws s3 sync /data/virtualdoc/files s3://virtualdoc-backups/files/

# Cleanup old files
find /data/virtualdoc/files -type f -mtime +90 -delete
```

### 3. Disaster Recovery

```bash
#!/bin/bash
# disaster-recovery.sh

# Restore database
aws s3 cp s3://virtualdoc-backups/postgres/latest.sql.gz /tmp/
gunzip /tmp/latest.sql.gz
docker exec -i virtualdoc-postgres-prod psql -U virtualdoc virtualdoc < /tmp/latest.sql

# Restore files
aws s3 sync s3://virtualdoc-backups/files/ /data/virtualdoc/files/

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);

-- Analyze tables
ANALYZE patients;
ANALYZE appointments;
ANALYZE medical_records;
```

### 2. Caching Strategy

```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. Load Balancing

```nginx
# nginx.conf
upstream auth_service {
    least_conn;
    server auth-service-1:3001;
    server auth-service-2:3001;
    server auth-service-3:3001;
}

server {
    location /api/auth/ {
        proxy_pass http://auth_service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check service logs
docker logs virtualdoc-auth-service-prod

# Check service status
docker ps | grep virtualdoc

# Restart service
docker-compose -f docker-compose.prod.yml restart auth-service
```

#### 2. Database Connection Issues
```bash
# Check database status
docker exec virtualdoc-postgres-prod pg_isready

# Check database logs
docker logs virtualdoc-postgres-prod

# Test connection
docker exec virtualdoc-postgres-prod psql -U virtualdoc -d virtualdoc -c "SELECT 1;"
```

#### 3. Memory Issues
```bash
# Check memory usage
docker stats

# Check system memory
free -h

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Performance Monitoring

```bash
# Monitor CPU usage
htop

# Monitor memory usage
free -h

# Monitor disk usage
df -h

# Monitor network usage
iftop
```

---

This deployment guide ensures VirtualDoc is deployed securely, efficiently, and with high availability in production environments. Regular monitoring, backups, and updates are essential for maintaining a healthy production system.
