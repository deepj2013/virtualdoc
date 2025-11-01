# Database Schema Design - Part 3

## 12. BILLING & PAYMENTS MODULE

### invoices
Invoice records
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    balance_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_terms TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### invoice_items
Invoice line items
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'consultation', 'procedure', 'medicine', 'test', 'service'
    item_description VARCHAR(255) NOT NULL,
    item_code VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    reference_id UUID, -- Reference to appointment, prescription, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### payments
Payment transactions
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'card', 'upi', 'netbanking', 'cheque', 'insurance'
    payment_type VARCHAR(50), -- 'full', 'partial', 'advance', 'refund'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    transaction_id VARCHAR(255),
    reference_number VARCHAR(255),
    bank_name VARCHAR(255),
    cheque_number VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    gateway VARCHAR(100), -- 'razorpay', 'stripe', 'payu', etc.
    gateway_response JSONB,
    processed_by UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### insurance_claims
Insurance claim records
```sql
CREATE TABLE insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    insurance_provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100),
    claim_number VARCHAR(100) UNIQUE,
    claim_amount DECIMAL(10,2) NOT NULL,
    approved_amount DECIMAL(10,2),
    claim_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'under_review', 'approved', 'rejected', 'settled'
    settlement_date DATE,
    rejection_reason TEXT,
    documents_url TEXT[], -- Array of document URLs
    submitted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 13. REPORTING & ANALYTICS MODULE

### custom_reports
Saved custom reports
```sql
CREATE TABLE custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'patient', 'appointment', 'revenue', 'inventory', 'hr', 'custom'
    report_category VARCHAR(100),
    description TEXT,
    query_config JSONB, -- Saved query parameters
    filters JSONB, -- Saved filters
    created_by UUID REFERENCES users(id),
    is_shared BOOLEAN DEFAULT false,
    shared_with_roles TEXT[], -- Array of roles that can access
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### report_schedules
Scheduled report generation
```sql
CREATE TABLE report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    custom_report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    schedule_config JSONB, -- Day, time, etc.
    recipients TEXT[], -- Array of email addresses
    format VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv'
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### analytics_events
Analytics event tracking
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    entity_type VARCHAR(50), -- 'appointment', 'prescription', 'report', etc.
    entity_id UUID,
    event_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 14. NOTIFICATIONS MODULE

### notification_templates
Notification templates
```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'appointment_reminder', 'prescription_ready', 'report_available', 'payment_due', 'system'
    title VARCHAR(255) NOT NULL,
    body_text TEXT NOT NULL,
    body_html TEXT,
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### notifications
System notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    icon_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_notification_preferences
User notification settings
```sql
CREATE TABLE user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    channel_email BOOLEAN DEFAULT true,
    channel_sms BOOLEAN DEFAULT false,
    channel_push BOOLEAN DEFAULT true,
    channel_whatsapp BOOLEAN DEFAULT false,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id, notification_type)
);
```

---

## 15. SYSTEM CONFIGURATION MODULE

### system_settings
Global system settings
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50), -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(100), -- 'general', 'security', 'payment', 'communication'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can be accessed by frontend
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### tenant_domains
Custom domain configurations
```sql
CREATE TABLE tenant_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    verification_token VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    ssl_certificate TEXT, -- Encrypted
    ssl_expiry_date DATE,
    cname_record VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'active', 'expired'
    configured_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### audit_logs
System audit trail
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### file_storage
File metadata (actual files stored in cloud storage)
```sql
CREATE TABLE file_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    storage_provider VARCHAR(50) DEFAULT 's3', -- 's3', 'azure', 'gcs', 'local'
    storage_bucket VARCHAR(255),
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_id VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'restricted'
    uploaded_by UUID REFERENCES users(id),
    entity_type VARCHAR(100), -- What this file belongs to
    entity_id UUID,
    tags TEXT[],
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

## INDEXES FOR PERFORMANCE

```sql
-- Multi-tenant indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);

-- User indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_roles_user_tenant ON user_roles(user_id, tenant_id);

-- Patient indexes
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_email ON patients(email);

-- Appointment indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Medical records indexes
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);

-- Communication indexes
CREATE INDEX idx_communications_recipient ON communications(recipient_id);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_type ON communications(communication_type);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

---

## COMPLETE SCHEMA SUMMARY

### Total Tables: ~60+ tables organized into 15 modules

1. **Multi-Tenant** (4 tables): tenants, tenant_configurations, tenant_modules, departments
2. **User & Auth** (6 tables): users, user_roles, permissions, role_permissions, user_sessions
3. **Patient** (4 tables): patients, patient_family, patient_allergies, patient_past_illnesses
4. **Medical Records** (6 tables): medical_records, prescriptions, prescription_items, medical_reports, report_files, report_results
5. **Appointments** (3 tables): doctor_rosters, appointments, appointment_reminders
6. **Telemedicine** (2 tables): telemedicine_consultations, telemedicine_messages
7. **Providers** (4 tables): healthcare_providers, provider_services, provider_orders, order_items
8. **Communication** (3 tables): communication_templates, communications, communication_configurations
9. **Inventory** (5 tables): inventory_categories, inventory_items, inventory_stock, inventory_transactions, inventory_orders
10. **HR** (5 tables): employees, employee_attendance, leave_types, employee_leaves, payroll
11. **Care** (3 tables): caregivers, patient_care_assignments, caregiver_visits
12. **Billing** (4 tables): invoices, invoice_items, payments, insurance_claims
13. **Reporting** (3 tables): custom_reports, report_schedules, analytics_events
14. **Notifications** (3 tables): notification_templates, notifications, user_notification_preferences
15. **System** (4 tables): system_settings, tenant_domains, audit_logs, file_storage

---

This completes the comprehensive database schema design!
