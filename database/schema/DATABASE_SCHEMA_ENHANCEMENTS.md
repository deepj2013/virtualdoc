# Database Schema - Enhanced Patient Management & Clinical Operations

## 🎯 Overview
Comprehensive enhancements for patient management, OPD/IPD operations, admission/discharge processes, facility configurations, and long-term business analytics.

---

## 17. ENHANCED PATIENT INFORMATION MODULE

### patient_extended_info
Extended patient information (medical and non-medical)
```sql
CREATE TABLE patient_extended_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    information_category VARCHAR(100) NOT NULL, -- 'medical', 'lifestyle', 'occupation', 'insurance', 'emergency', 'preferences', 'social_history'
    information_key VARCHAR(255) NOT NULL,
    information_value TEXT,
    information_type VARCHAR(50), -- 'text', 'number', 'date', 'boolean', 'json'
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    source VARCHAR(100), -- 'patient_self', 'doctor_entry', 'family_member', 'previous_records'
    entered_by UUID REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'normal', -- 'critical', 'high', 'normal', 'low'
    is_sensitive BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, information_category, information_key)
);
```

### patient_vital_signs
Historical vital signs records
```sql
CREATE TABLE patient_vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    recorded_by UUID REFERENCES users(id),
    temperature_celsius DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation DECIMAL(5,2),
    blood_glucose DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    pain_scale INTEGER CHECK (pain_scale BETWEEN 0 AND 10),
    gcs_score INTEGER CHECK (gcs_score BETWEEN 3 AND 15), -- Glasgow Coma Scale
    urine_output_ml DECIMAL(8,2),
    other_vitals JSONB, -- Store additional vital signs as key-value pairs
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### patient_lifestyle_factors
Lifestyle and social history
```sql
CREATE TABLE patient_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    factor_type VARCHAR(100) NOT NULL, -- 'diet', 'exercise', 'smoking', 'alcohol', 'substance_use', 'sleep', 'occupation', 'marital_status', 'education'
    factor_value VARCHAR(255),
    frequency VARCHAR(100), -- 'daily', 'weekly', 'occasional', 'never'
    quantity VARCHAR(100),
    duration_years DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'current', -- 'current', 'past', 'never'
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### patient_family_medical_history
Family medical history
```sql
CREATE TABLE patient_family_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    family_member_relation VARCHAR(50) NOT NULL, -- 'father', 'mother', 'sibling', 'grandparent', 'other'
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    age_of_onset INTEGER,
    status VARCHAR(50), -- 'alive', 'deceased', 'unknown'
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 18. OPD/IPD & ADMISSION MODULE

### admissions
Patient admission records
```sql
CREATE TABLE admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    admission_type VARCHAR(50) NOT NULL CHECK (admission_type IN ('opd', 'ipd', 'emergency', 'day_care', 'observation')),
    admission_date TIMESTAMP NOT NULL,
    admission_reason TEXT NOT NULL,
    admitting_doctor_id UUID REFERENCES users(id) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ward_id UUID REFERENCES wards(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    bed_number VARCHAR(50),
    expected_discharge_date DATE,
    actual_discharge_date TIMESTAMP,
    discharge_status VARCHAR(50), -- 'discharged', 'against_medical_advice', 'transferred', 'expired'
    insurance_authorization_number VARCHAR(100),
    insurance_authorized_amount DECIMAL(10,2),
    emergency_contact_verified BOOLEAN DEFAULT false,
    admission_notes TEXT,
    status VARCHAR(50) DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharged', 'transferred', 'expired', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### admission_vital_signs
Initial vital signs at admission
```sql
CREATE TABLE admission_vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id),
    temperature_celsius DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation DECIMAL(5,2),
    blood_glucose DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    gcs_score INTEGER,
    other_vitals JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### discharge_summaries
Discharge summary reports
```sql
CREATE TABLE discharge_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    summary_number VARCHAR(50) UNIQUE NOT NULL,
    discharge_date TIMESTAMP NOT NULL,
    discharge_type VARCHAR(50) NOT NULL CHECK (discharge_type IN ('routine', 'against_medical_advice', 'transferred', 'expired', 'home_care')),
    discharging_doctor_id UUID REFERENCES users(id) NOT NULL,
    
    -- Admission Details
    admission_date TIMESTAMP NOT NULL,
    admission_diagnosis TEXT,
    chief_complaint TEXT,
    
    -- Clinical Course
    clinical_course TEXT,
    procedures_performed TEXT[], -- Array of procedure names
    complications TEXT,
    
    -- Condition at Discharge
    condition_at_discharge VARCHAR(50) CHECK (condition_at_discharge IN ('stable', 'improved', 'critical', 'expired', 'transferred')),
    final_diagnosis TEXT NOT NULL,
    icd_codes TEXT[], -- Array of ICD codes
    
    -- Discharge Instructions
    discharge_instructions TEXT NOT NULL,
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_date DATE,
    follow_up_doctor_id UUID REFERENCES users(id),
    medications_on_discharge TEXT[],
    diet_instructions TEXT,
    activity_restrictions TEXT,
    
    -- Special Instructions
    wound_care_instructions TEXT,
    warning_signs TEXT,
    
    -- Administrative
    length_of_stay_days INTEGER,
    total_bill_amount DECIMAL(10,2),
    next_appointment_date DATE,
    
    -- Additional Information
    patient_advice TEXT,
    family_advice TEXT,
    notes TEXT,
    
    -- Status and Approval
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'issued')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### wards
Hospital wards/units
```sql
CREATE TABLE wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    ward_name VARCHAR(255) NOT NULL,
    ward_code VARCHAR(50) UNIQUE,
    ward_type VARCHAR(50) NOT NULL CHECK (ward_type IN ('general', 'icu', 'ccu', 'nicu', 'pediatric', 'maternity', 'isolation', 'private', 'semi_private')),
    floor_number INTEGER,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    occupied_beds INTEGER DEFAULT 0,
    charge_per_day DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    incharge_nurse_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### beds
Individual bed management
```sql
CREATE TABLE beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ward_id UUID REFERENCES wards(id) ON DELETE CASCADE NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    bed_type VARCHAR(50) NOT NULL CHECK (bed_type IN ('regular', 'icu', 'ventilator', 'isolation', 'private')),
    is_occupied BOOLEAN DEFAULT false,
    current_admission_id UUID REFERENCES admissions(id) ON DELETE SET NULL,
    is_available BOOLEAN DEFAULT true,
    is_maintenance_required BOOLEAN DEFAULT false,
    maintenance_notes TEXT,
    equipment_available TEXT[], -- Array of equipment
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, bed_number)
);
```

---

## 19. SERVICE & FACILITY CONFIGURATION MODULE

### tenant_services
Services available per tenant
```sql
CREATE TABLE tenant_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    service_code VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL, -- 'diagnostic', 'therapeutic', 'surgical', 'consultation', 'imaging', 'laboratory', 'pharmacy', 'ambulance'
    service_type VARCHAR(100), -- 'xray', 'mri', 'ct_scan', 'ultrasound', 'lab_test', 'consultation', 'surgery', 'physiotherapy'
    description TEXT,
    standard_price DECIMAL(10,2),
    duration_minutes INTEGER,
    requires_doctor_referral BOOLEAN DEFAULT false,
    requires_appointment BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_emergency_available BOOLEAN DEFAULT false,
    availability_schedule JSONB, -- Day-wise availability
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, service_code)
);
```

### tenant_facilities
Facilities/amenities available per tenant
```sql
CREATE TABLE tenant_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    facility_code VARCHAR(100) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    facility_category VARCHAR(100) NOT NULL, -- 'diagnostic', 'therapeutic', 'accommodation', 'support', 'infrastructure'
    description TEXT,
    capacity INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_charged BOOLEAN DEFAULT false,
    charge_per_use DECIMAL(10,2),
    operating_hours JSONB, -- Operating hours configuration
    booking_required BOOLEAN DEFAULT false,
    advance_booking_days INTEGER,
    maintenance_schedule JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, facility_code)
);
```

### service_bookings
Service appointments/bookings
```sql
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    service_id UUID REFERENCES tenant_services(id) ON DELETE CASCADE NOT NULL,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    referred_by UUID REFERENCES users(id),
    service_provider_id UUID REFERENCES users(id), -- Lab tech, radiologist, etc.
    facility_id UUID REFERENCES tenant_facilities(id) ON DELETE SET NULL,
    charges DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    result_ready BOOLEAN DEFAULT false,
    result_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 20. ENHANCED REPORTING MODULE

### structured_reports
Structured reports with key-value data
```sql
CREATE TABLE structured_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    report_type VARCHAR(100) NOT NULL, -- 'lab', 'imaging', 'xray', 'ct_scan', 'mri', 'ultrasound', 'pathology', 'radiology'
    report_category VARCHAR(100), -- 'diagnostic', 'screening', 'monitoring', 'follow_up'
    report_number VARCHAR(50) UNIQUE NOT NULL,
    service_booking_id UUID REFERENCES service_bookings(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    
    -- Report Header
    ordered_by UUID REFERENCES users(id),
    order_date TIMESTAMP,
    performed_by UUID REFERENCES users(id), -- Lab tech, radiologist, etc.
    performed_at TIMESTAMP,
    reported_by UUID REFERENCES users(id), -- Doctor who reviewed/signed
    reported_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    
    -- Report Content (Structured)
    report_template_id UUID, -- Reference to report templates
    report_data JSONB NOT NULL, -- Structured key-value pairs
    
    /* Example structure:
    {
      "patient_info": {
        "name": "John Doe",
        "age": "45",
        "gender": "Male"
      },
      "test_info": {
        "test_name": "Complete Blood Count",
        "sample_type": "Blood",
        "sample_date": "2024-01-15"
      },
      "results": {
        "hemoglobin": {
          "value": "14.5",
          "unit": "g/dL",
          "normal_range": "13.5-17.5",
          "flag": "normal"
        },
        "wbc": {
          "value": "7500",
          "unit": "/μL",
          "normal_range": "4000-11000",
          "flag": "normal"
        }
      },
      "findings": "All parameters within normal limits",
      "impression": "Normal CBC",
      "recommendations": "No further action required"
    }
    */
    
    -- Report Details
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    conclusion TEXT,
    
    -- Status and Priority
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'corrected')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'stat', 'routine', 'normal')),
    is_critical BOOLEAN DEFAULT false,
    critical_value_notified BOOLEAN DEFAULT false,
    notified_to UUID REFERENCES users(id),
    notified_at TIMESTAMP,
    
    -- Quality Control
    quality_check_passed BOOLEAN DEFAULT false,
    quality_checked_by UUID REFERENCES users(id),
    
    -- File Attachments
    attachment_urls TEXT[],
    
    -- Additional Information
    notes TEXT,
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### report_templates
Standardized report templates
```sql
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_code VARCHAR(100) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    template_version VARCHAR(20) DEFAULT '1.0',
    template_structure JSONB NOT NULL, -- Define structure/schema
    
    /* Example structure:
    {
      "sections": [
        {
          "section_name": "Patient Information",
          "fields": [
            {"key": "patient_name", "type": "text", "required": true},
            {"key": "age", "type": "number", "required": true},
            {"key": "gender", "type": "select", "options": ["Male", "Female", "Other"]}
          ]
        },
        {
          "section_name": "Test Results",
          "fields": [
            {"key": "hemoglobin", "type": "number", "unit": "g/dL", "normal_range": "13.5-17.5"},
            {"key": "wbc", "type": "number", "unit": "/μL", "normal_range": "4000-11000"}
          ]
        }
      ],
      "validation_rules": {...}
    }
    */
    
    is_active BOOLEAN DEFAULT true,
    is_standard BOOLEAN DEFAULT false, -- System-wide standard template
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, template_code, template_version)
);
```

### report_attachments
Files associated with reports
```sql
CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    structured_report_id UUID REFERENCES structured_reports(id) ON DELETE CASCADE NOT NULL,
    attachment_type VARCHAR(50) NOT NULL, -- 'image', 'pdf', 'dicom', 'document', 'chart', 'graph'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    thumbnail_url TEXT,
    is_primary BOOLEAN DEFAULT false, -- Primary attachment for display
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT true
);
```

---

## 21. BUSINESS ANALYTICS & DATA WAREHOUSING MODULE

### analytics_facts
Fact table for analytics
```sql
CREATE TABLE analytics_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    fact_type VARCHAR(100) NOT NULL, -- 'appointment', 'admission', 'discharge', 'service', 'revenue', 'patient_visit'
    fact_date DATE NOT NULL,
    
    -- Dimensions
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    service_id UUID REFERENCES tenant_services(id) ON DELETE SET NULL,
    
    -- Measures
    count_value INTEGER DEFAULT 1,
    revenue_amount DECIMAL(10,2) DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    
    -- Additional Metrics (as JSONB for flexibility)
    metrics JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### analytics_dimensions
Dimension tables for analytics
```sql
CREATE TABLE analytics_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_type VARCHAR(100) NOT NULL, -- 'time', 'geography', 'patient_segment', 'doctor_category', 'service_category'
    dimension_key VARCHAR(255) NOT NULL,
    dimension_value VARCHAR(255) NOT NULL,
    parent_dimension_id UUID REFERENCES analytics_dimensions(id) ON DELETE SET NULL,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dimension_type, dimension_key)
);
```

### analytics_dashboards
Saved dashboard configurations
```sql
CREATE TABLE analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    dashboard_name VARCHAR(255) NOT NULL,
    dashboard_type VARCHAR(100), -- 'executive', 'clinical', 'financial', 'operational', 'custom'
    dashboard_config JSONB NOT NULL, -- Widgets, filters, chart configurations
    is_shared BOOLEAN DEFAULT false,
    shared_with_roles TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### analytics_reports_scheduled
Scheduled analytics reports
```sql
CREATE TABLE analytics_reports_scheduled (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    schedule_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    schedule_config JSONB,
    recipients TEXT[], -- Email addresses
    report_config JSONB, -- Query, filters, format
    format VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'html'
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 22. ENHANCED USER ROLES MODULE

### user_role_extensions
Extended roles and permissions
```sql
CREATE TABLE user_role_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    role_category VARCHAR(100) NOT NULL, -- 'clinical', 'administrative', 'support', 'technical'
    role_type VARCHAR(100) NOT NULL, -- 'doctor', 'nurse', 'receptionist', 'crm', 'marketing', 'dietitian', 'fitness_coach', 'lab_technician', 'radiologist'
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    specialization TEXT[], -- Array of specializations
    certifications TEXT[], -- Array of certifications
    license_number VARCHAR(255),
    license_expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## INDEXES FOR NEW TABLES

```sql
-- Patient extended info
CREATE INDEX idx_patient_extended_info_patient ON patient_extended_info(patient_id);
CREATE INDEX idx_patient_extended_info_category ON patient_extended_info(information_category);

-- Vital signs
CREATE INDEX idx_patient_vital_signs_patient ON patient_vital_signs(patient_id);
CREATE INDEX idx_patient_vital_signs_recorded_at ON patient_vital_signs(recorded_at DESC);

-- Admissions
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_tenant ON admissions(tenant_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_date ON admissions(admission_date DESC);

-- Discharge summaries
CREATE INDEX idx_discharge_summaries_admission ON discharge_summaries(admission_id);
CREATE INDEX idx_discharge_summaries_patient ON discharge_summaries(patient_id);
CREATE INDEX idx_discharge_summaries_date ON discharge_summaries(discharge_date DESC);

-- Services and facilities
CREATE INDEX idx_tenant_services_tenant ON tenant_services(tenant_id);
CREATE INDEX idx_tenant_services_category ON tenant_services(service_category);
CREATE INDEX idx_tenant_facilities_tenant ON tenant_facilities(tenant_id);

-- Structured reports
CREATE INDEX idx_structured_reports_patient ON structured_reports(patient_id);
CREATE INDEX idx_structured_reports_type ON structured_reports(report_type);
CREATE INDEX idx_structured_reports_status ON structured_reports(status);
CREATE INDEX idx_structured_reports_critical ON structured_reports(is_critical) WHERE is_critical = true;

-- Analytics
CREATE INDEX idx_analytics_facts_tenant_date ON analytics_facts(tenant_id, fact_date DESC);
CREATE INDEX idx_analytics_facts_type ON analytics_facts(fact_type);
CREATE INDEX idx_analytics_facts_date ON analytics_facts(fact_date DESC);
```

---

## FEATURES ADDED

✅ Comprehensive patient information (medical and non-medical)
✅ Vital signs tracking with historical data
✅ Lifestyle factors and social history
✅ Family medical history
✅ OPD/IPD admission management
✅ Ward and bed management
✅ Discharge summary reports
✅ Admission vital signs
✅ Tenant-specific services configuration (X-ray, Lab, etc.)
✅ Facility management per tenant
✅ Structured reporting with key-value data
✅ Report templates for standardization
✅ 20-year analytics support (facts and dimensions)
✅ Business intelligence dashboards
✅ Scheduled analytics reports
✅ Enhanced user roles (Receptionist, CRM, Marketing, Dietitian, Fitness Coach)

---

This comprehensive enhancement supports full clinical operations with proper documentation, reporting, and long-term analytics capabilities.
