# VirtualDoc - Healthcare Microservices Platform

A comprehensive healthcare management platform built with microservices architecture, designed to scale from individual doctors to large hospital systems.

## 🏗️ Architecture Overview

VirtualDoc follows a microservices architecture with two main categories:

### Common Microservices (Shared Services)
- **Authentication Service** - User authentication and authorization
- **User Management Service** - User profiles and role management
- **Notification Service** - Email, SMS, and push notifications
- **File Storage Service** - Document and image management
- **Audit Service** - Activity logging and compliance

### Specific Microservices (Domain Services)
- **Patient Management Service** - Patient records and demographics
- **Appointment Service** - Scheduling and appointment management
- **Medical Records Service** - Clinical notes and medical history
- **Billing Service** - Invoicing and payment processing
- **Inventory Service** - Medical supplies and equipment
- **Reporting Service** - Analytics and reporting

### Frontend Applications
- **Web Application** - Main web interface for doctors and staff
- **Patient Portal** - Patient-facing web application
- **Admin Dashboard** - Administrative interface
- **Mobile App** - React Native mobile application

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6+

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/deepj2013/virtualdoc.git
cd virtualdoc
```

2. **Start infrastructure services**
```bash
docker-compose up -d postgres redis
```

3. **Install dependencies**
```bash
# Install backend dependencies
cd backend/common && npm install
cd ../specific && npm install

# Install frontend dependencies
cd ../../frontend && npm install
```

4. **Start all services**
```bash
docker-compose up -d
```

## 📁 Project Structure

```
virtualdoc/
├── backend/
│   ├── common/                 # Common microservices
│   │   ├── auth-service/
│   │   ├── user-service/
│   │   ├── notification-service/
│   │   ├── file-service/
│   │   └── audit-service/
│   ├── specific/               # Domain-specific microservices
│   │   ├── patient-service/
│   │   ├── appointment-service/
│   │   ├── medical-records-service/
│   │   ├── billing-service/
│   │   ├── inventory-service/
│   │   └── reporting-service/
│   └── shared/                 # Shared libraries and utilities
├── frontend/
│   ├── web-app/               # Main web application
│   ├── patient-portal/        # Patient-facing web app
│   ├── admin-dashboard/       # Administrative interface
│   └── mobile-app/            # React Native mobile app
├── infrastructure/
│   ├── docker/                # Docker configurations
│   ├── kubernetes/            # K8s manifests
│   ├── nginx/                 # API Gateway configuration
│   └── monitoring/            # Monitoring and logging
├── docs/                      # Documentation
└── scripts/                   # Deployment and utility scripts
```

## 🏥 Use Cases

### Individual Doctor
- Patient management
- Appointment scheduling
- Medical record keeping
- Basic billing

### Small Clinic
- Multi-doctor support
- Shared patient records
- Inventory management
- Advanced reporting

### Large Hospital
- Department-based organization
- Complex workflow management
- Integration with existing systems
- Enterprise-level security and compliance

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **JWT** for authentication
- **Docker** for containerization

### Frontend
- **React** with TypeScript
- **Next.js** for web applications
- **React Native** for mobile
- **Material-UI** for components
- **Redux** for state management

### Infrastructure
- **Docker Compose** for local development
- **Kubernetes** for production deployment
- **Nginx** as API Gateway
- **Prometheus & Grafana** for monitoring

## 📋 Features

### Core Features
- ✅ Multi-tenant architecture
- ✅ Role-based access control
- ✅ Real-time notifications
- ✅ Secure file storage
- ✅ Audit logging
- ✅ API documentation

### Healthcare Features
- ✅ Patient management
- ✅ Appointment scheduling
- ✅ Medical records
- ✅ Prescription management
- ✅ Billing and invoicing
- ✅ Reporting and analytics

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Deployment Guide](./docs/deployment/)
- [Architecture Guide](./docs/architecture/)
- [Contributing Guidelines](./docs/contributing/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**VirtualDoc** - Digitizing healthcare, one practice at a time.
