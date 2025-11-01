# VirtualDoc Complete Database Schema Design

## 🎯 Overview
Comprehensive database schema for SaaS-based healthcare platform supporting Doctors, Hospitals, Clinics, Patients, Labs, and other healthcare providers.

## 📋 Schema Structure

This schema is organized into logical modules:

1. **Multi-Tenant & Organization** - SaaS tenant management
2. **User & Authentication** - Users, roles, permissions
3. **Patient Management** - Patient data, family, medical history
4. **Medical Records** - Prescriptions, reports, allergies, past illness
5. **Appointments & Scheduling** - Appointments, rosters, availability
6. **Telemedicine** - Video consultations, chat
7. **Healthcare Providers** - Labs, MRI, Chemist, other providers
8. **Communication** - Email, SMS, WhatsApp integration
9. **Inventory Management** - Medical supplies, equipment
10. **HR Management** - Staff, departments, payroll
11. **Care Management** - Caretakers, caregivers
12. **Billing & Payments** - Invoices, payments, insurance
13. **Reporting & Analytics** - Reports, dashboards
14. **Notifications** - System notifications
15. **System Configuration** - Settings, custom domains

---

## 1. MULTI-TENANT & ORGANIZATION MODULE

### tenants
SaaS tenant/organization management
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hospital', 'clinic', 'doctor', 'lab', 'mri', 'chemist'
    custom_domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'freemium', -- 'freemium', 'premium', 'enterprise'
    subscription_start DATE,
    subscription_end DATE,
    max_users INTEGER DEFAULT 10,
    max_patients INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tenant_configurations
Tenant-specific configurations
```sql
CREATE TABLE tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50), -- 'string', 'number', 'boolean', 'json'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, config_key)
);
```

### tenant_modules
Module enablement per tenant
```sql
CREATE TABLE tenant_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL, -- 'telemedicine', 'inventory', 'hr', 'lab_management'
    is_enabled BOOLEAN DEFAULT false,
    configured_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, module_name)
);
```

### departments
Hospital/Clinic departments
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    head_doctor_id UUID, -- References users table
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. USER & AUTHENTICATION MODULE

### users
Main users table (Doctors, Staff, Patients, Admins)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    middle_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20), -- 'male', 'female', 'other'
    profile_picture_url TEXT,
    role VARCHAR(50) NOT NULL, -- 'super_admin', 'admin', 'sub_admin', 'doctor', 'nurse', 'staff', 'patient', 'lab_technician', 'chemist'
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);
```

### user_roles
Role assignments
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, tenant_id, role, department_id)
);
```

### permissions
System permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### role_permissions
Role-Permission mapping
```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);
```

### user_sessions
Active user sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. PATIENT MANAGEMENT MODULE

### patients
Patient information
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- If patient has account
    patient_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    insurance_provider VARCHAR(255),
    insurance_number VARCHAR(100),
    abha_id VARCHAR(50), -- Ayushman Bharat Health Account ID
    aadhar_number VARCHAR(12), -- Masked in database
    pan_number VARCHAR(10), -- Masked in database
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### patient_family
Family member relationships
```sql
CREATE TABLE patient_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    family_member_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL, -- 'spouse', 'child', 'parent', 'sibling', 'guardian'
    is_primary_contact BOOLEAN DEFAULT false,
    can_access_records BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, family_member_id, relationship)
);
```

### patient_allergies
Patient allergies
```sql
CREATE TABLE patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    allergen_name VARCHAR(255) NOT NULL,
    allergen_type VARCHAR(50), -- 'drug', 'food', 'environmental', 'other'
    severity VARCHAR(20), -- 'mild', 'moderate', 'severe', 'life_threatening'
    reaction_description TEXT,
    first_observed DATE,
    diagnosed_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### patient_past_illnesses
Past medical history
```sql
CREATE TABLE patient_past_illnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    illness_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20), -- International Classification of Diseases
    diagnosis_date DATE,
    resolved_date DATE,
    status VARCHAR(50) DEFAULT 'resolved', -- 'active', 'resolved', 'chronic', 'recurring'
    notes TEXT,
    diagnosed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. MEDICAL RECORDS MODULE

### medical_records
Main medical records table
```sql
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    record_type VARCHAR(50) NOT NULL, -- 'consultation', 'prescription', 'lab_report', 'imaging', 'surgery', 'vaccination'
    visit_date TIMESTAMP,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    icd_codes TEXT[], -- Array of ICD codes
    notes TEXT,
    follow_up_date DATE,
    is_confidential BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### prescriptions
Prescription details
```sql
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prescription_number VARCHAR(50) UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until DATE,
    instructions TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    is_telemedicine BOOLEAN DEFAULT false,
    consultation_id UUID, -- References telemedicine_consultations if telemedicine
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### prescription_items
Prescription medicines
```sql
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100), -- '500mg', '10ml'
    frequency VARCHAR(100), -- 'twice daily', 'after meals'
    duration VARCHAR(100), -- '7 days', '2 weeks'
    quantity INTEGER,
    instructions TEXT,
    route VARCHAR(50), -- 'oral', 'injection', 'topical', 'inhalation'
    timing VARCHAR(100), -- 'before meals', 'after meals', 'with meals'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### medical_reports
Lab reports, imaging reports, etc.
```sql
CREATE TABLE medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- 'lab', 'imaging', 'pathology', 'radiology', 'other'
    report_name VARCHAR(255) NOT NULL,
    provider_id UUID, -- References healthcare_providers for external labs
    provider_name VARCHAR(255),
    ordered_by UUID REFERENCES users(id),
    order_date TIMESTAMP,
    report_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    findings TEXT,
    interpretation TEXT,
    recommendations TEXT,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### report_files
Attached report files (PDF, images, etc.)
```sql
CREATE TABLE report_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50), -- 'pdf', 'image', 'dicom'
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT true
);
```

### report_results
Lab test results
```sql
CREATE TABLE report_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50), -- LOINC code
    result_value VARCHAR(255),
    unit VARCHAR(50),
    normal_range VARCHAR(100),
    abnormal_flag VARCHAR(20), -- 'normal', 'high', 'low', 'critical'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. APPOINTMENTS & SCHEDULING MODULE

### doctor_rosters
Doctor availability rosters
```sql
CREATE TABLE doctor_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    roster_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    consultation_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'telemedicine', 'both'
    max_appointments_per_slot INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, roster_date, start_time)
);
```

### appointments
Appointment bookings
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50) DEFAULT 'in_person', -- 'in_person', 'telemedicine', 'follow_up'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    reason TEXT,
    chief_complaint TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    estimated_duration_minutes INTEGER DEFAULT 30,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    consultation_fee DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'waived'
    booking_source VARCHAR(50), -- 'walk_in', 'online', 'phone', 'app'
    booked_by UUID REFERENCES users(id),
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### appointment_reminders
Reminder tracking
```sql
CREATE TABLE appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50), -- 'email', 'sms', 'whatsapp', 'push'
    reminder_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 6. TELEMEDICINE MODULE

### telemedicine_consultations
Video/chat consultations
```sql
CREATE TABLE telemedicine_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) DEFAULT 'video', -- 'video', 'audio', 'chat'
    scheduled_start TIMESTAMP NOT NULL,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'failed'
    meeting_room_id VARCHAR(255),
    meeting_url TEXT,
    meeting_recording_url TEXT,
    recording_consent BOOLEAN DEFAULT false,
    notes TEXT,
    quality_rating INTEGER, -- 1-5
    quality_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### telemedicine_messages
Chat messages during consultation
```sql
CREATE TABLE telemedicine_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES telemedicine_consultations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'file', 'prescription'
    message_content TEXT,
    attachment_url TEXT,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. HEALTHCARE PROVIDERS MODULE

### healthcare_providers
External providers (Labs, MRI, Chemist)
```sql
CREATE TABLE healthcare_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE, -- If provider is also a tenant
    provider_type VARCHAR(50) NOT NULL, -- 'lab', 'imaging', 'mri', 'chemist', 'ambulance', 'other'
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    license_number VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    integration_type VARCHAR(50), -- 'api', 'manual', 'file_upload'
    api_endpoint TEXT,
    api_key TEXT, -- Encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### provider_services
Services offered by providers
```sql
CREATE TABLE provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    service_code VARCHAR(50),
    description TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### provider_orders
Orders placed with external providers
```sql
CREATE TABLE provider_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    order_type VARCHAR(50) NOT NULL, -- 'lab_test', 'imaging', 'medicine'
    order_number VARCHAR(50) UNIQUE NOT NULL,
    ordered_by UUID REFERENCES users(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
    total_amount DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### order_items
Items in provider orders
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_order_id UUID REFERENCES provider_orders(id) ON DELETE CASCADE,
    service_id UUID REFERENCES provider_services(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

*This is Part 1 of the schema. Continue with remaining modules...*
