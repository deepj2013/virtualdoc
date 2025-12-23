# VirtualDoc Diagrams Documentation

This folder contains all architectural and flow diagrams for the VirtualDoc project. Each diagram provides clarity on different aspects of the system.

## Diagram Index

### 1. User Roles & Workflows (`01_user_roles_workflows.drawio.xml`)
**Purpose**: Shows all user types, their responsibilities, and complete workflows for each role.

**Contents**:
- Part 1: User Roles & Responsibilities Wireframe
  - Universal Admin, Sub Admin, Tenant Admin
  - Doctor, Nurse
  - Receptionist, Lab Technician, Chemist/Pharmacist, Staff
  - Patient
- Part 2: User Workflows
  - Step-by-step workflows for each user type
  - Color-coded by role category

**Use Case**: Understanding user roles, permissions, and how each user type interacts with the system.

---

### 2. System Architecture (`02_system_architecture.drawio.xml`)
**Purpose**: High-level overview of the entire system architecture.

**Contents**:
- Client Layer (Web App, Mobile App, Admin Panel)
- API Gateway Layer
- Microservices Layer (All services with ports)
- Data Layer (PostgreSQL, Redis, File Storage)
- Technology Stack

**Use Case**: Understanding the overall system structure and component relationships.

---

### 3. Database ERD (`03_database_erd.drawio.xml`)
**Purpose**: Entity Relationship Diagram showing database schema and relationships.

**Contents**:
- Core tables (tenants, users, patients, appointments, medical_records, prescriptions, video_calls)
- Authentication tables (auth_tokens, user_sessions, admin_users, admin_roles)
- Relationships between entities (1:1, 1:N, N:1)
- Key fields and constraints

**Use Case**: Understanding database structure, relationships, and data flow between tables.

---

### 4. Authentication Flow (`04_authentication_flow.drawio.xml`)
**Purpose**: Detailed step-by-step authentication process.

**Contents**:
- 10-step authentication flow
- Security features (password hashing, token management, account lockout)
- Database and Redis interactions
- JWT token generation and storage

**Use Case**: Understanding how user authentication works, security measures, and token management.

---

### 5. API Request Flow (`05_api_request_flow.drawio.xml`)
**Purpose**: Complete flow of an API request from client to database and back.

**Contents**:
- 10-step API request processing
- Middleware layers (Auth, Validation, RBAC)
- Error handling
- Response flow

**Use Case**: Understanding how API requests are processed, validated, and responded to.

---

### 6. Deployment Architecture (`06_deployment_architecture.drawio.xml`)
**Purpose**: Docker-based deployment architecture and container setup.

**Contents**:
- Docker containers for all services
- Docker network configuration
- Volume management
- Deployment commands and health checks

**Use Case**: Understanding deployment structure, container orchestration, and operational procedures.

---

### 7. Frontend Navigation (`07_frontend_navigation.drawio.xml`)
**Purpose**: Complete frontend menu structure and navigation for all user roles.

**Contents**:
- Menu items for each role (Admin, Doctor, Nurse, Receptionist, Lab Technician, Chemist, Staff, Patient)
- Page descriptions and functionality for each menu item
- Public pages (Landing, Login)
- Role-based access control visualization
- Color-coded by role category

**Use Case**: Understanding what pages and menus each user role can access, frontend navigation structure, and role-based UI permissions.

---

## How to Use

1. **Open in draw.io**: 
   - Go to https://app.diagrams.net
   - File → Open from → Device
   - Select any `.drawio.xml` file

2. **Edit Diagrams**: 
   - All diagrams are editable in draw.io
   - Make changes as needed
   - Export as PNG, SVG, or PDF

3. **Update Documentation**: 
   - When making architectural changes, update relevant diagrams
   - Keep diagrams in sync with codebase

---

## Diagram Conventions

### Color Coding:
- **Red**: Admin roles, Microservices
- **Green**: Clinical staff (Doctor, Nurse), Database
- **Blue**: Support staff (Receptionist, Lab Tech, etc.), API Gateway
- **Purple**: Patient, Flow steps
- **Orange**: Frontend applications
- **Yellow**: Information boxes, Technology stack

### Naming Convention:
- Files are numbered sequentially (01, 02, 03...)
- Descriptive names indicate diagram purpose
- All files use `.drawio.xml` extension

---

## Future Diagrams to Add

- [ ] Microservices Communication Diagram
- [ ] Data Flow Diagram (detailed)
- [ ] Security Architecture Diagram
- [ ] Video Consultation Flow
- [ ] Appointment Booking Flow (detailed)
- [ ] Billing & Payment Flow
- [ ] Notification System Flow
- [ ] Multi-tenant Architecture Details

---

## Maintenance

- **Update Frequency**: Update diagrams when major architectural changes occur
- **Version Control**: All diagrams are version controlled in Git
- **Review**: Review diagrams during architecture reviews and onboarding

---

## Questions?

For questions about any diagram or to request new diagrams, contact the development team or create an issue in the project repository.

