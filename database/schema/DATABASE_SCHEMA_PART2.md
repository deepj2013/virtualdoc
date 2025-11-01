# Database Schema Design - Part 2

## 8. COMMUNICATION MODULE

### communication_templates
Email/SMS/WhatsApp templates
```sql
CREATE TABLE communication_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
    subject VARCHAR(255),
    body_text TEXT NOT NULL,
    body_html TEXT,
    variables JSONB, -- Template variables like {{patient_name}}, {{appointment_date}}
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### communications
Communication logs
```sql
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'push'
    recipient_type VARCHAR(50) NOT NULL, -- 'patient', 'doctor', 'staff'
    recipient_id UUID, -- References users or patients
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    template_id UUID REFERENCES communication_templates(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    message_body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    provider VARCHAR(50), -- 'sendgrid', 'twilio', 'aws_ses', 'whatsapp_api'
    provider_message_id VARCHAR(255),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### communication_configurations
Provider configurations (API keys, etc.)
```sql
CREATE TABLE communication_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp'
    provider_name VARCHAR(100) NOT NULL, -- 'sendgrid', 'twilio', 'aws_ses'
    api_endpoint TEXT,
    api_key_encrypted TEXT, -- Encrypted API keys
    api_secret_encrypted TEXT,
    sender_id VARCHAR(100), -- Email sender or SMS sender ID
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Primary, secondary, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. INVENTORY MANAGEMENT MODULE

### inventory_categories
Inventory categories
```sql
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    parent_category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### inventory_items
Medical supplies, equipment, medicines
```sql
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    item_type VARCHAR(50) NOT NULL, -- 'medicine', 'equipment', 'supply', 'consumable'
    manufacturer VARCHAR(255),
    brand VARCHAR(255),
    unit_of_measure VARCHAR(50), -- 'piece', 'box', 'bottle', 'pack', 'kg', 'liter'
    reorder_level INTEGER DEFAULT 10,
    max_stock_level INTEGER,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    hsn_code VARCHAR(50), -- For GST
    expiry_date DATE,
    batch_number VARCHAR(100),
    barcode VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### inventory_stock
Current stock levels
```sql
CREATE TABLE inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    location VARCHAR(255), -- Warehouse location, room number, etc.
    quantity_available INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER DEFAULT 0,
    last_stocked_date DATE,
    expiry_date DATE,
    batch_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, department_id, location, batch_number)
);
```

### inventory_transactions
Stock movements
```sql
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'transfer', 'adjustment', 'expired', 'damaged'
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    reference_number VARCHAR(100), -- PO number, invoice number, etc.
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### inventory_orders
Purchase orders
```sql
CREATE TABLE inventory_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID, -- References healthcare_providers if supplier is in system
    supplier_name VARCHAR(255),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'partially_received', 'completed', 'cancelled'
    total_amount DECIMAL(10,2),
    ordered_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 10. HR MANAGEMENT MODULE

### employees
Staff/employee records
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    employee_type VARCHAR(50) NOT NULL, -- 'doctor', 'nurse', 'receptionist', 'admin', 'lab_tech', 'pharmacist', 'other'
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(255),
    joining_date DATE NOT NULL,
    leaving_date DATE,
    employment_type VARCHAR(50), -- 'full_time', 'part_time', 'contract', 'intern'
    salary DECIMAL(10,2),
    salary_currency VARCHAR(10) DEFAULT 'INR',
    bank_account_number VARCHAR(50), -- Encrypted
    bank_ifsc VARCHAR(20),
    pan_number VARCHAR(10), -- Encrypted
    aadhar_number VARCHAR(12), -- Encrypted
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    reporting_manager_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### employee_attendance
Attendance records
```sql
CREATE TABLE employee_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    work_hours DECIMAL(4,2),
    status VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'late', 'half_day', 'leave'
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, attendance_date)
);
```

### leave_types
Leave type definitions
```sql
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    max_days_per_year INTEGER,
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### employee_leaves
Leave applications
```sql
CREATE TABLE employee_leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    applied_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### payroll
Salary records
```sql
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(10,2),
    allowances DECIMAL(10,2),
    deductions DECIMAL(10,2),
    gross_salary DECIMAL(10,2),
    net_salary DECIMAL(10,2),
    payment_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'cheque'
    transaction_reference VARCHAR(100),
    payslip_url TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. CARE MANAGEMENT MODULE

### caregivers
Caretaker/Caregiver information
```sql
CREATE TABLE caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    caregiver_type VARCHAR(50) NOT NULL, -- 'caretaker', 'caregiver', 'home_nurse', 'attendant'
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    qualification TEXT,
    experience_years INTEGER,
    specializations TEXT[], -- Array of specializations
    hourly_rate DECIMAL(10,2),
    availability_status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'off_duty'
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rating DECIMAL(3,2), -- Average rating 1-5
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### patient_care_assignments
Patient-caregiver assignments
```sql
CREATE TABLE patient_care_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    caregiver_id UUID REFERENCES caregivers(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id), -- Doctor or family member
    assignment_type VARCHAR(50) DEFAULT 'temporary', -- 'temporary', 'permanent', 'emergency'
    start_date DATE NOT NULL,
    end_date DATE,
    care_type TEXT[], -- Array of care types needed
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### caregiver_visits
Caregiver visit logs
```sql
CREATE TABLE caregiver_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    care_assignment_id UUID REFERENCES patient_care_assignments(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    scheduled_time TIME,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    duration_minutes INTEGER,
    services_provided TEXT,
    notes TEXT,
    patient_condition TEXT,
    medication_administered TEXT,
    visit_status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
    rating INTEGER, -- 1-5
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

*Continue with Part 3...*
