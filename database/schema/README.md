# VirtualDoc Database Schema Documentation

## 📊 Complete Database Schema Design

This directory contains the complete database schema design for the VirtualDoc SaaS healthcare platform.

## 📁 Files

### Documentation Files
1. **DATABASE_SCHEMA_DESIGN.md** - Part 1: Multi-tenant, Users, Patients, Medical Records, Appointments, Telemedicine, Providers
2. **DATABASE_SCHEMA_PART2.md** - Part 2: Communication, Inventory, HR, Care Management
3. **DATABASE_SCHEMA_PART3.md** - Part 3: Billing, Reporting, Notifications, System Configuration
4. **DATABASE_SCHEMA_VIDEO_CALLING.md** - Video Calling & Meeting Management Module
5. **DATABASE_SCHEMA_ENHANCEMENTS.md** - Enhanced Patient Management, OPD/IPD, Services, Reporting, Analytics

### Visualization Files
4. **virtualdoc_database_schema.drawio.xml** - Draw.io XML file for ER diagram visualization

## 🗄️ Schema Overview

### Total Tables: 100+ tables across 23 modules

#### Module Breakdown:
1. **Multi-Tenant & Organization** (4 tables)
   - tenants, tenant_configurations, tenant_modules, departments

2. **User & Authentication** (6 tables)
   - users, user_roles, permissions, role_permissions, user_sessions

3. **Patient Management** (4 tables)
   - patients, patient_family, patient_allergies, patient_past_illnesses

4. **Medical Records** (6 tables)
   - medical_records, prescriptions, prescription_items, medical_reports, report_files, report_results

5. **Appointments & Scheduling** (3 tables)
   - doctor_rosters, appointments, appointment_reminders

6. **Telemedicine** (2 tables)
   - telemedicine_consultations, telemedicine_messages

7. **Video Calling & Meetings** (7 tables)
   - video_call_sessions, video_call_participants, video_call_invitations, video_call_recordings, video_call_chat_messages, video_call_analytics, video_call_settings

8. **Healthcare Providers** (4 tables)
   - healthcare_providers, provider_services, provider_orders, order_items

9. **Communication** (3 tables)
   - communication_templates, communications, communication_configurations

10. **Inventory Management** (5 tables)
   - inventory_categories, inventory_items, inventory_stock, inventory_transactions, inventory_orders

11. **HR Management** (5 tables)
    - employees, employee_attendance, leave_types, employee_leaves, payroll

12. **Care Management** (3 tables)
    - caregivers, patient_care_assignments, caregiver_visits

13. **Billing & Payments** (4 tables)
    - invoices, invoice_items, payments, insurance_claims

14. **Reporting & Analytics** (3 tables)
    - custom_reports, report_schedules, analytics_events

15. **Notifications** (3 tables)
    - notification_templates, notifications, user_notification_preferences

16. **System Configuration** (4 tables)
    - system_settings, tenant_domains, audit_logs, file_storage

17. **Enhanced Patient Information** (4 tables)
    - patient_extended_info, patient_vital_signs, patient_lifestyle_factors, patient_family_medical_history

18. **OPD/IPD & Admission** (5 tables)
    - admissions, admission_vital_signs, discharge_summaries, wards, beds

19. **Service & Facility Configuration** (3 tables)
    - tenant_services, tenant_facilities, service_bookings

20. **Enhanced Reporting** (3 tables)
    - structured_reports, report_templates, report_attachments

21. **Business Analytics & Data Warehousing** (4 tables)
    - analytics_facts, analytics_dimensions, analytics_dashboards, analytics_reports_scheduled

22. **Enhanced User Roles** (1 table)
    - user_role_extensions

23. **Authentication & Admin Management** (10 tables)
    - admin_roles, admin_users, authentication_tokens, password_reset_tokens, email_verification_tokens, api_keys, login_attempts, account_locks, admin_permissions, admin_role_permissions, admin_activity_logs

## 🎨 Viewing the ER Diagram

### Using Draw.io

1. **Open Draw.io**
   - Go to https://app.diagrams.net/ or use the desktop app

2. **Import the XML file**
   - File → Open → Select `virtualdoc_database_schema.drawio.xml`

3. **View and Edit**
   - The diagram will load with all tables and relationships
   - You can modify, rearrange, or add more tables as needed
   - Export as PNG, PDF, or SVG when done

### Alternative Tools

You can also import this schema into:
- **dbdiagram.io** - Create visual database diagrams
- **Lucidchart** - Professional diagramming tool
- **MySQL Workbench** - Database design tool
- **pgAdmin** - PostgreSQL administration tool

## 🔧 Implementation

### PostgreSQL Implementation

The schema is designed for PostgreSQL with:
- UUID primary keys
- Foreign key constraints
- Indexes for performance
- JSONB for flexible data storage
- Array types for multi-value fields

### Next Steps

1. **Review the schema** - Ensure all requirements are covered
2. **Customize as needed** - Add/modify tables based on specific needs
3. **Create migration files** - Convert to database migration scripts
4. **Set up relationships** - Define foreign keys and constraints
5. **Add indexes** - Optimize for query performance
6. **Implement data validation** - Add check constraints and triggers

## 📝 Key Features Supported

✅ Multi-tenant SaaS architecture
✅ Role-based access control (RBAC)
✅ Patient family member management
✅ Complete medical history tracking
✅ Prescription management
✅ Medical report uploads (Lab, MRI, Imaging)
✅ Appointment scheduling with rosters
✅ Telemedicine consultations
✅ Video calling with guest links (Doctor-Patient, Team Meetings)
✅ Meeting recording and transcription
✅ Comprehensive patient information (medical & non-medical)
✅ Vital signs tracking with historical data
✅ Lifestyle factors and family medical history
✅ OPD/IPD admission management
✅ Ward and bed management
✅ Discharge summary reports
✅ Tenant-specific services (X-ray, MRI, Lab, Dietitian, Fitness Coach, etc.)
✅ Structured reporting with key-value organized data
✅ 20-year business analytics support
✅ Enhanced user roles (Receptionist, CRM, Marketing, Dietitian, Fitness Coach)
✅ Universal Admin, Sub-Admin, Tenant Admin management
✅ Comprehensive token management (JWT, refresh, API keys, password reset)
✅ Session management with device tracking
✅ Login attempt tracking and account lockout
✅ Admin activity audit logging
✅ Healthcare provider integration (Labs, MRI, Chemist)
✅ Email, SMS, WhatsApp notifications
✅ Inventory management
✅ HR management (Staff, Payroll, Attendance)
✅ Caretaker/Caregiver assignments
✅ Billing and payment processing
✅ Insurance claim management
✅ Custom domain support
✅ Audit logging
✅ Analytics and reporting

## 🔒 Security Considerations

- All sensitive data (SSN, Aadhar, PAN) should be encrypted
- PHI (Protected Health Information) must be HIPAA compliant
- Audit logs track all data access
- Role-based permissions control access
- Secure file storage with encryption

## 📚 Related Documentation

- See `guidelines/developer/README.md` for HIPAA compliance guidelines
- See `docs/architecture/TECHNICAL_ARCHITECTURE.md` for system architecture
- See `database/init.sql` for basic schema implementation

---

**Note**: This is a comprehensive schema design. Implement in phases based on priority and business requirements.
