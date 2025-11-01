-- VirtualDoc Complete Database Schema
-- PostgreSQL Schema for SaaS Healthcare Platform
-- Version: 1.0.0
-- Date: 2024

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. MULTI-TENANT & ORGANIZATION MODULE
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('hospital', 'clinic', 'doctor', 'lab', 'mri', 'chemist', 'pharmacy')),
    custom_domain VARCHAR(255) UNIQUE,
    subdomain VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'freemium' CHECK (subscription_tier IN ('freemium', 'premium', 'enterprise')),
    subscription_start DATE,
    subscription_end DATE,
    max_users INTEGER DEFAULT 10,
    max_patients INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenant_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, config_key)
);

CREATE TABLE tenant_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    configured_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, module_name)
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    head_doctor_id UUID, -- References users table
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. USER & AUTHENTICATION MODULE
-- ============================================

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
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    profile_picture_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'sub_admin', 'doctor', 'nurse', 'staff', 'patient', 'lab_technician', 'chemist', 'receptionist')),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, tenant_id, role, department_id)
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_manage BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    access_token_id UUID, -- Will reference authentication_tokens
    refresh_token_id UUID, -- Will reference authentication_tokens
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'api')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB,
    login_method VARCHAR(50) CHECK (login_method IN ('password', 'oauth', 'sso', 'api_key', '2fa')),
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    logged_out_at TIMESTAMP,
    logout_reason VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false,
    forced_logout BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PATIENT MANAGEMENT MODULE
-- ============================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    patient_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
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
    abha_id VARCHAR(50),
    aadhar_number VARCHAR(12), -- Should be encrypted in production
    pan_number VARCHAR(10), -- Should be encrypted in production
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_family (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    family_member_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('spouse', 'child', 'parent', 'sibling', 'guardian', 'other')),
    is_primary_contact BOOLEAN DEFAULT false,
    can_access_records BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, family_member_id, relationship),
    CHECK (patient_id != family_member_id)
);

CREATE TABLE patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    allergen_name VARCHAR(255) NOT NULL,
    allergen_type VARCHAR(50) CHECK (allergen_type IN ('drug', 'food', 'environmental', 'other')),
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
    reaction_description TEXT,
    first_observed DATE,
    diagnosed_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_past_illnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    illness_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    diagnosis_date DATE,
    resolved_date DATE,
    status VARCHAR(50) DEFAULT 'resolved' CHECK (status IN ('active', 'resolved', 'chronic', 'recurring')),
    notes TEXT,
    diagnosed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. MEDICAL RECORDS MODULE
-- ============================================

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('consultation', 'prescription', 'lab_report', 'imaging', 'surgery', 'vaccination', 'other')),
    visit_date TIMESTAMP,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    icd_codes TEXT[],
    notes TEXT,
    follow_up_date DATE,
    is_confidential BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prescription_number VARCHAR(50) UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until DATE,
    instructions TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    is_telemedicine BOOLEAN DEFAULT false,
    consultation_id UUID,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity INTEGER,
    instructions TEXT,
    route VARCHAR(50) CHECK (route IN ('oral', 'injection', 'topical', 'inhalation', 'nasal', 'otic', 'ophthalmic', 'other')),
    timing VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('lab', 'imaging', 'pathology', 'radiology', 'other')),
    report_name VARCHAR(255) NOT NULL,
    provider_id UUID,
    provider_name VARCHAR(255),
    ordered_by UUID REFERENCES users(id),
    order_date TIMESTAMP,
    report_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    findings TEXT,
    interpretation TEXT,
    recommendations TEXT,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) CHECK (file_type IN ('pdf', 'image', 'dicom', 'document', 'other')),
    file_size_bytes BIGINT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT true
);

CREATE TABLE report_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_report_id UUID REFERENCES medical_reports(id) ON DELETE CASCADE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50),
    result_value VARCHAR(255),
    unit VARCHAR(50),
    normal_range VARCHAR(100),
    abnormal_flag VARCHAR(20) CHECK (abnormal_flag IN ('normal', 'high', 'low', 'critical')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. APPOINTMENTS & SCHEDULING MODULE
-- ============================================

CREATE TABLE doctor_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    roster_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30,
    consultation_type VARCHAR(50) DEFAULT 'in_person' CHECK (consultation_type IN ('in_person', 'telemedicine', 'both')),
    max_appointments_per_slot INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, roster_date, start_time),
    CHECK (end_time > start_time)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    appointment_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type VARCHAR(50) DEFAULT 'in_person' CHECK (appointment_type IN ('in_person', 'telemedicine', 'follow_up')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    chief_complaint TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    estimated_duration_minutes INTEGER DEFAULT 30,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    consultation_fee DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'partial', 'waived')),
    booking_source VARCHAR(50) CHECK (booking_source IN ('walk_in', 'online', 'phone', 'app', 'other')),
    booked_by UUID REFERENCES users(id),
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
    reminder_type VARCHAR(50) CHECK (reminder_type IN ('email', 'sms', 'whatsapp', 'push')),
    reminder_time TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 16. VIDEO CALLING & MEETING MODULE
-- ============================================

CREATE TABLE video_call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('consultation', 'team_meeting', 'training', 'conference', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    duration_minutes INTEGER,
    meeting_room_id VARCHAR(255) UNIQUE NOT NULL,
    meeting_room_password VARCHAR(100),
    meeting_url TEXT NOT NULL,
    host_url TEXT NOT NULL,
    guest_link TEXT UNIQUE NOT NULL,
    guest_link_expires_at TIMESTAMP,
    max_participants INTEGER DEFAULT 100,
    is_recording_enabled BOOLEAN DEFAULT false,
    recording_url TEXT,
    is_live BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'ended')),
    meeting_provider VARCHAR(50) DEFAULT 'custom' CHECK (meeting_provider IN ('zoom', 'jitsi', 'custom', 'twilio', 'aws_chime')),
    provider_session_id VARCHAR(255),
    waiting_room_enabled BOOLEAN DEFAULT true,
    chat_enabled BOOLEAN DEFAULT true,
    screen_sharing_enabled BOOLEAN DEFAULT true,
    mute_on_entry BOOLEAN DEFAULT false,
    auto_record BOOLEAN DEFAULT false,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN ('host', 'co_host', 'participant', 'guest', 'panelist')),
    participant_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    is_guest BOOLEAN DEFAULT false,
    guest_token VARCHAR(255) UNIQUE,
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'rejected', 'removed')),
    device_type VARCHAR(50) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'phone')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    audio_enabled BOOLEAN DEFAULT true,
    video_enabled BOOLEAN DEFAULT true,
    screen_shared BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    is_on_hold BOOLEAN DEFAULT false,
    waiting_room_admitted_at TIMESTAMP,
    admitted_by UUID REFERENCES users(id),
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
    meeting_role VARCHAR(50),
    invitation_sent_at TIMESTAMP,
    invitation_method VARCHAR(50) CHECK (invitation_method IN ('email', 'sms', 'whatsapp', 'in_app', 'guest_link')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_call_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    invited_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_email VARCHAR(255),
    invited_phone VARCHAR(20),
    invitation_type VARCHAR(50) NOT NULL CHECK (invitation_type IN ('email', 'sms', 'whatsapp', 'in_app', 'guest_link')),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_url TEXT,
    sent_by UUID REFERENCES users(id),
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'accepted', 'declined', 'failed')),
    opened_at TIMESTAMP,
    responded_at TIMESTAMP,
    response VARCHAR(50) CHECK (response IN ('accepted', 'declined', 'tentative')),
    reminder_sent BOOLEAN DEFAULT false,
    last_reminder_sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    recording_type VARCHAR(50) NOT NULL CHECK (recording_type IN ('full', 'audio_only', 'screen_only', 'transcript')),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    format VARCHAR(50) CHECK (format IN ('mp4', 'mp3', 'webm', 'transcript')),
    storage_provider VARCHAR(50) DEFAULT 's3' CHECK (storage_provider IN ('s3', 'azure', 'gcs', 'local')),
    storage_bucket VARCHAR(255),
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_id VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'private' CHECK (access_level IN ('public', 'private', 'restricted', 'patients_only')),
    transcribed BOOLEAN DEFAULT false,
    transcript_url TEXT,
    transcription_status VARCHAR(50) CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
    recording_start TIMESTAMP NOT NULL,
    recording_end TIMESTAMP NOT NULL,
    recording_status VARCHAR(50) DEFAULT 'processing' CHECK (recording_status IN ('processing', 'completed', 'failed', 'deleted')),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP,
    deleted_at TIMESTAMP,
    retention_days INTEGER DEFAULT 365,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_call_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_type VARCHAR(50) CHECK (sender_type IN ('host', 'participant', 'guest')),
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    message_content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    is_private BOOLEAN DEFAULT false,
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255),
    is_pinned BOOLEAN DEFAULT false,
    pinned_by UUID REFERENCES users(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    read_by TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_call_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('default_meeting_settings', 'user_preferences')),
    default_duration_minutes INTEGER DEFAULT 60,
    default_max_participants INTEGER DEFAULT 100,
    auto_record BOOLEAN DEFAULT false,
    waiting_room_enabled BOOLEAN DEFAULT true,
    mute_on_entry BOOLEAN DEFAULT false,
    require_password BOOLEAN DEFAULT false,
    default_password VARCHAR(100),
    guest_link_enabled BOOLEAN DEFAULT true,
    guest_link_expires_hours INTEGER,
    require_registration BOOLEAN DEFAULT false,
    provider VARCHAR(50) DEFAULT 'custom',
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id, setting_type)
);

-- ============================================
-- 23. ENHANCED AUTHENTICATION & ADMIN MODULE
-- ============================================

CREATE TABLE admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_code VARCHAR(50) UNIQUE NOT NULL CHECK (role_code IN ('universal_admin', 'sub_admin', 'tenant_admin', 'super_admin')),
    role_name VARCHAR(100) NOT NULL,
    role_description TEXT,
    hierarchy_level INTEGER NOT NULL CHECK (hierarchy_level BETWEEN 1 AND 10),
    permissions JSONB NOT NULL,
    can_manage_users BOOLEAN DEFAULT false,
    can_manage_tenants BOOLEAN DEFAULT false,
    can_manage_admins BOOLEAN DEFAULT false,
    can_access_analytics BOOLEAN DEFAULT false,
    can_manage_billing BOOLEAN DEFAULT false,
    can_configure_system BOOLEAN DEFAULT false,
    scope VARCHAR(50) DEFAULT 'global' CHECK (scope IN ('global', 'tenant', 'department')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
    admin_role_code VARCHAR(50) NOT NULL CHECK (admin_role_code IN ('universal_admin', 'sub_admin', 'tenant_admin')),
    assigned_tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    assigned_departments UUID[],
    is_active BOOLEAN DEFAULT true,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    suspended_by UUID REFERENCES users(id),
    suspended_at TIMESTAMP,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    requires_password_change BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    backup_codes TEXT[],
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tenant_id)
);

CREATE TABLE authentication_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token_type VARCHAR(50) NOT NULL CHECK (token_type IN ('access_token', 'refresh_token', 'api_key', 'password_reset', 'email_verification', '2fa_token')),
    token_hash VARCHAR(255) NOT NULL,
    token_value TEXT,
    jti VARCHAR(255) UNIQUE,
    refresh_token_id UUID REFERENCES authentication_tokens(id) ON DELETE SET NULL,
    device_id VARCHAR(255),
    device_info TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_value VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    token_value VARCHAR(255) NOT NULL,
    verification_type VARCHAR(50) DEFAULT 'email' CHECK (verification_type IN ('email', 'phone', '2fa')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT false,
    is_expired BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_scope VARCHAR(50) DEFAULT 'read_write' CHECK (key_scope IN ('read', 'write', 'read_write', 'admin')),
    permissions JSONB,
    ip_whitelist TEXT[],
    rate_limit_per_minute INTEGER DEFAULT 100,
    rate_limit_per_hour INTEGER DEFAULT 1000,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoked_reason TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempt_type VARCHAR(50) DEFAULT 'password' CHECK (attempt_type IN ('password', 'oauth', 'api_key', '2fa')),
    success BOOLEAN DEFAULT false,
    failure_reason VARCHAR(255),
    device_fingerprint VARCHAR(255),
    location JSONB,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    lock_type VARCHAR(50) NOT NULL CHECK (lock_type IN ('failed_attempts', 'admin_lock', 'suspicious_activity', 'security_breach')),
    lock_reason TEXT,
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP,
    unlocked_at TIMESTAMP,
    unlocked_by UUID REFERENCES users(id),
    unlock_reason TEXT,
    failed_attempts INTEGER DEFAULT 0,
    is_permanent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    permission_category VARCHAR(100) NOT NULL CHECK (permission_category IN ('user_management', 'tenant_management', 'billing', 'analytics', 'system_config', 'security')),
    description TEXT,
    applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('universal_admin', 'sub_admin', 'tenant_admin', 'all')),
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_role_id UUID REFERENCES admin_roles(id) ON DELETE CASCADE NOT NULL,
    permission_id UUID REFERENCES admin_permissions(id) ON DELETE CASCADE NOT NULL,
    can_read BOOLEAN DEFAULT false,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_execute BOOLEAN DEFAULT false,
    conditions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_role_id, permission_id)
);

CREATE TABLE admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'view', 'export', 'configure', 'suspend', 'activate')),
    resource_type VARCHAR(100) NOT NULL CHECK (resource_type IN ('user', 'tenant', 'admin', 'billing', 'config', 'subscription', 'service')),
    resource_id UUID,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    location JSONB,
    changes_made JSONB,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'security')),
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update user_sessions to reference authentication_tokens
ALTER TABLE user_sessions 
    ADD CONSTRAINT fk_user_sessions_access_token 
    FOREIGN KEY (access_token_id) REFERENCES authentication_tokens(id) ON DELETE SET NULL;

ALTER TABLE user_sessions 
    ADD CONSTRAINT fk_user_sessions_refresh_token 
    FOREIGN KEY (refresh_token_id) REFERENCES authentication_tokens(id) ON DELETE SET NULL;

-- ============================================
-- 17. ENHANCED PATIENT INFORMATION MODULE
-- ============================================

CREATE TABLE patient_extended_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    information_category VARCHAR(100) NOT NULL CHECK (information_category IN ('medical', 'lifestyle', 'occupation', 'insurance', 'emergency', 'preferences', 'social_history')),
    information_key VARCHAR(255) NOT NULL,
    information_value TEXT,
    information_type VARCHAR(50) CHECK (information_type IN ('text', 'number', 'date', 'boolean', 'json')),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    source VARCHAR(100) CHECK (source IN ('patient_self', 'doctor_entry', 'family_member', 'previous_records')),
    entered_by UUID REFERENCES users(id),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('critical', 'high', 'normal', 'low')),
    is_sensitive BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, information_category, information_key)
);

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
    gcs_score INTEGER CHECK (gcs_score BETWEEN 3 AND 15),
    urine_output_ml DECIMAL(8,2),
    other_vitals JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_lifestyle_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    factor_type VARCHAR(100) NOT NULL CHECK (factor_type IN ('diet', 'exercise', 'smoking', 'alcohol', 'substance_use', 'sleep', 'occupation', 'marital_status', 'education')),
    factor_value VARCHAR(255),
    frequency VARCHAR(100),
    quantity VARCHAR(100),
    duration_years DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'current' CHECK (status IN ('current', 'past', 'never')),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patient_family_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    family_member_relation VARCHAR(50) NOT NULL CHECK (family_member_relation IN ('father', 'mother', 'sibling', 'grandparent', 'uncle', 'aunt', 'other')),
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    age_of_onset INTEGER,
    status VARCHAR(50) CHECK (status IN ('alive', 'deceased', 'unknown')),
    notes TEXT,
    recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 18. OPD/IPD & ADMISSION MODULE
-- ============================================

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
    equipment_available TEXT[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ward_id, bed_number)
);

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
    discharge_status VARCHAR(50) CHECK (discharge_status IN ('discharged', 'against_medical_advice', 'transferred', 'expired')),
    insurance_authorization_number VARCHAR(100),
    insurance_authorized_amount DECIMAL(10,2),
    emergency_contact_verified BOOLEAN DEFAULT false,
    admission_notes TEXT,
    status VARCHAR(50) DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharged', 'transferred', 'expired', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE discharge_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    summary_number VARCHAR(50) UNIQUE NOT NULL,
    discharge_date TIMESTAMP NOT NULL,
    discharge_type VARCHAR(50) NOT NULL CHECK (discharge_type IN ('routine', 'against_medical_advice', 'transferred', 'expired', 'home_care')),
    discharging_doctor_id UUID REFERENCES users(id) NOT NULL,
    admission_date TIMESTAMP NOT NULL,
    admission_diagnosis TEXT,
    chief_complaint TEXT,
    clinical_course TEXT,
    procedures_performed TEXT[],
    complications TEXT,
    condition_at_discharge VARCHAR(50) CHECK (condition_at_discharge IN ('stable', 'improved', 'critical', 'expired', 'transferred')),
    final_diagnosis TEXT NOT NULL,
    icd_codes TEXT[],
    discharge_instructions TEXT NOT NULL,
    follow_up_required BOOLEAN DEFAULT true,
    follow_up_date DATE,
    follow_up_doctor_id UUID REFERENCES users(id),
    medications_on_discharge TEXT[],
    diet_instructions TEXT,
    activity_restrictions TEXT,
    wound_care_instructions TEXT,
    warning_signs TEXT,
    length_of_stay_days INTEGER,
    total_bill_amount DECIMAL(10,2),
    next_appointment_date DATE,
    patient_advice TEXT,
    family_advice TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'issued')),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 19. SERVICE & FACILITY CONFIGURATION MODULE
-- ============================================

CREATE TABLE tenant_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    service_code VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL CHECK (service_category IN ('diagnostic', 'therapeutic', 'surgical', 'consultation', 'imaging', 'laboratory', 'pharmacy', 'ambulance', 'other')),
    service_type VARCHAR(100) CHECK (service_type IN ('xray', 'mri', 'ct_scan', 'ultrasound', 'lab_test', 'consultation', 'surgery', 'physiotherapy', 'dietitian', 'fitness', 'other')),
    description TEXT,
    standard_price DECIMAL(10,2),
    duration_minutes INTEGER,
    requires_doctor_referral BOOLEAN DEFAULT false,
    requires_appointment BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_emergency_available BOOLEAN DEFAULT false,
    availability_schedule JSONB,
    provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, service_code)
);

CREATE TABLE tenant_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    facility_code VARCHAR(100) NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    facility_category VARCHAR(100) NOT NULL CHECK (facility_category IN ('diagnostic', 'therapeutic', 'accommodation', 'support', 'infrastructure')),
    description TEXT,
    capacity INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    is_charged BOOLEAN DEFAULT false,
    charge_per_use DECIMAL(10,2),
    operating_hours JSONB,
    booking_required BOOLEAN DEFAULT false,
    advance_booking_days INTEGER,
    maintenance_schedule JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, facility_code)
);

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
    service_provider_id UUID REFERENCES users(id),
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

-- ============================================
-- 20. ENHANCED REPORTING MODULE
-- ============================================

CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_name VARCHAR(255) NOT NULL,
    template_code VARCHAR(100) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    template_version VARCHAR(20) DEFAULT '1.0',
    template_structure JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_standard BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, template_code, template_version)
);

CREATE TABLE structured_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('lab', 'imaging', 'xray', 'ct_scan', 'mri', 'ultrasound', 'pathology', 'radiology', 'other')),
    report_category VARCHAR(100) CHECK (report_category IN ('diagnostic', 'screening', 'monitoring', 'follow_up')),
    report_number VARCHAR(50) UNIQUE NOT NULL,
    service_booking_id UUID REFERENCES service_bookings(id) ON DELETE SET NULL,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    ordered_by UUID REFERENCES users(id),
    order_date TIMESTAMP,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP,
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    report_template_id UUID REFERENCES report_templates(id) ON DELETE SET NULL,
    report_data JSONB NOT NULL,
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    conclusion TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'corrected')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('urgent', 'stat', 'routine', 'normal')),
    is_critical BOOLEAN DEFAULT false,
    critical_value_notified BOOLEAN DEFAULT false,
    notified_to UUID REFERENCES users(id),
    notified_at TIMESTAMP,
    quality_check_passed BOOLEAN DEFAULT false,
    quality_checked_by UUID REFERENCES users(id),
    attachment_urls TEXT[],
    notes TEXT,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    structured_report_id UUID REFERENCES structured_reports(id) ON DELETE CASCADE NOT NULL,
    attachment_type VARCHAR(50) NOT NULL CHECK (attachment_type IN ('image', 'pdf', 'dicom', 'document', 'chart', 'graph')),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    thumbnail_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_encrypted BOOLEAN DEFAULT true
);

-- ============================================
-- 21. BUSINESS ANALYTICS & DATA WAREHOUSING MODULE
-- ============================================

CREATE TABLE analytics_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    fact_type VARCHAR(100) NOT NULL CHECK (fact_type IN ('appointment', 'admission', 'discharge', 'service', 'revenue', 'patient_visit', 'prescription', 'report')),
    fact_date DATE NOT NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    service_id UUID REFERENCES tenant_services(id) ON DELETE SET NULL,
    count_value INTEGER DEFAULT 1,
    revenue_amount DECIMAL(10,2) DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    metrics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_dimensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dimension_type VARCHAR(100) NOT NULL CHECK (dimension_type IN ('time', 'geography', 'patient_segment', 'doctor_category', 'service_category', 'department')),
    dimension_key VARCHAR(255) NOT NULL,
    dimension_value VARCHAR(255) NOT NULL,
    parent_dimension_id UUID REFERENCES analytics_dimensions(id) ON DELETE SET NULL,
    metadata JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(dimension_type, dimension_key)
);

CREATE TABLE analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    dashboard_name VARCHAR(255) NOT NULL,
    dashboard_type VARCHAR(100) CHECK (dashboard_type IN ('executive', 'clinical', 'financial', 'operational', 'custom')),
    dashboard_config JSONB NOT NULL,
    is_shared BOOLEAN DEFAULT false,
    shared_with_roles TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analytics_reports_scheduled (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100),
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    schedule_config JSONB,
    recipients TEXT[],
    report_config JSONB,
    format VARCHAR(50) DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv', 'html')),
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 22. ENHANCED USER ROLES MODULE
-- ============================================

CREATE TABLE user_role_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    role_category VARCHAR(100) NOT NULL CHECK (role_category IN ('clinical', 'administrative', 'support', 'technical')),
    role_type VARCHAR(100) NOT NULL CHECK (role_type IN ('doctor', 'nurse', 'receptionist', 'crm', 'marketing', 'dietitian', 'fitness_coach', 'lab_technician', 'radiologist', 'pharmacist', 'admin', 'billing', 'other')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    specialization TEXT[],
    certifications TEXT[],
    license_number VARCHAR(255),
    license_expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Continue with remaining modules...
-- (Due to length, see separate files for complete schema)

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Multi-tenant indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

-- User indexes
CREATE INDEX idx_users_tenant_email ON users(tenant_id, email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_user_roles_user_tenant ON user_roles(user_id, tenant_id);

-- Patient indexes
CREATE INDEX idx_patients_tenant ON patients(tenant_id);
CREATE INDEX idx_patients_user_id ON patients(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_patients_number ON patients(patient_number);
CREATE INDEX idx_patients_phone ON patients(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;

-- Appointment indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_tenant_date ON appointments(tenant_id, appointment_date);

-- Medical records indexes
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);

-- Prescription indexes
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Report indexes
CREATE INDEX idx_medical_reports_patient ON medical_reports(patient_id);
CREATE INDEX idx_medical_reports_status ON medical_reports(status);
CREATE INDEX idx_medical_reports_type ON medical_reports(report_type);

-- Video call indexes
CREATE INDEX idx_video_call_sessions_tenant ON video_call_sessions(tenant_id);
CREATE INDEX idx_video_call_sessions_organizer ON video_call_sessions(organizer_id);
CREATE INDEX idx_video_call_sessions_appointment ON video_call_sessions(appointment_id);
CREATE INDEX idx_video_call_sessions_room_id ON video_call_sessions(meeting_room_id);
CREATE INDEX idx_video_call_sessions_guest_link ON video_call_sessions(guest_link);
CREATE INDEX idx_video_call_sessions_status ON video_call_sessions(status);
CREATE INDEX idx_participants_session ON video_call_participants(session_id);
CREATE INDEX idx_participants_guest_token ON video_call_participants(guest_token);
CREATE INDEX idx_invitations_session ON video_call_invitations(session_id);
CREATE INDEX idx_invitations_token ON video_call_invitations(invitation_token);
CREATE INDEX idx_recordings_session ON video_call_recordings(session_id);
CREATE INDEX idx_chat_messages_session ON video_call_chat_messages(session_id);

-- Enhanced patient info indexes
CREATE INDEX idx_patient_extended_info_patient ON patient_extended_info(patient_id);
CREATE INDEX idx_patient_extended_info_category ON patient_extended_info(information_category);
CREATE INDEX idx_patient_vital_signs_patient ON patient_vital_signs(patient_id);
CREATE INDEX idx_patient_vital_signs_recorded_at ON patient_vital_signs(recorded_at DESC);
CREATE INDEX idx_patient_lifestyle_patient ON patient_lifestyle_factors(patient_id);
CREATE INDEX idx_patient_family_history_patient ON patient_family_medical_history(patient_id);

-- Admission indexes
CREATE INDEX idx_admissions_patient ON admissions(patient_id);
CREATE INDEX idx_admissions_tenant ON admissions(tenant_id);
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_date ON admissions(admission_date DESC);
CREATE INDEX idx_admissions_type ON admissions(admission_type);
CREATE INDEX idx_discharge_summaries_admission ON discharge_summaries(admission_id);
CREATE INDEX idx_discharge_summaries_patient ON discharge_summaries(patient_id);
CREATE INDEX idx_discharge_summaries_date ON discharge_summaries(discharge_date DESC);

-- Ward and bed indexes
CREATE INDEX idx_wards_tenant ON wards(tenant_id);
CREATE INDEX idx_beds_ward ON beds(ward_id);
CREATE INDEX idx_beds_occupied ON beds(is_occupied) WHERE is_occupied = true;

-- Services and facilities indexes
CREATE INDEX idx_tenant_services_tenant ON tenant_services(tenant_id);
CREATE INDEX idx_tenant_services_category ON tenant_services(service_category);
CREATE INDEX idx_tenant_facilities_tenant ON tenant_facilities(tenant_id);
CREATE INDEX idx_service_bookings_patient ON service_bookings(patient_id);
CREATE INDEX idx_service_bookings_service ON service_bookings(service_id);
CREATE INDEX idx_service_bookings_status ON service_bookings(status);

-- Structured reports indexes
CREATE INDEX idx_structured_reports_patient ON structured_reports(patient_id);
CREATE INDEX idx_structured_reports_type ON structured_reports(report_type);
CREATE INDEX idx_structured_reports_status ON structured_reports(status);
CREATE INDEX idx_structured_reports_critical ON structured_reports(is_critical) WHERE is_critical = true;
CREATE INDEX idx_structured_reports_tenant ON structured_reports(tenant_id);

-- Analytics indexes
CREATE INDEX idx_analytics_facts_tenant_date ON analytics_facts(tenant_id, fact_date DESC);
CREATE INDEX idx_analytics_facts_type ON analytics_facts(fact_type);
CREATE INDEX idx_analytics_facts_date ON analytics_facts(fact_date DESC);
CREATE INDEX idx_analytics_facts_patient ON analytics_facts(patient_id) WHERE patient_id IS NOT NULL;
CREATE INDEX idx_analytics_dashboards_tenant ON analytics_dashboards(tenant_id);

-- User role extensions indexes
CREATE INDEX idx_user_role_extensions_user ON user_role_extensions(user_id);
CREATE INDEX idx_user_role_extensions_tenant ON user_role_extensions(tenant_id);
CREATE INDEX idx_user_role_extensions_role_type ON user_role_extensions(role_type);

-- Authentication & Admin indexes
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_tenant_id ON admin_users(tenant_id);
CREATE INDEX idx_admin_users_role_code ON admin_users(admin_role_code);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;

CREATE INDEX idx_auth_tokens_user_id ON authentication_tokens(user_id);
CREATE INDEX idx_auth_tokens_token_hash ON authentication_tokens(token_hash);
CREATE INDEX idx_auth_tokens_jti ON authentication_tokens(jti) WHERE jti IS NOT NULL;
CREATE INDEX idx_auth_tokens_expires_at ON authentication_tokens(expires_at);
CREATE INDEX idx_auth_tokens_active ON authentication_tokens(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_auth_tokens_type ON authentication_tokens(token_type);
CREATE INDEX idx_auth_tokens_user_type ON authentication_tokens(user_id, token_type);

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = true;
CREATE INDEX idx_user_sessions_current ON user_sessions(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_active ON password_reset_tokens(is_used, is_revoked, expires_at) WHERE is_used = false AND is_revoked = false;

CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_email ON email_verification_tokens(email);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at) WHERE is_active = true;

CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_failed ON login_attempts(user_id, success, attempted_at) WHERE success = false;

CREATE INDEX idx_account_locks_user_id ON account_locks(user_id);
CREATE INDEX idx_account_locks_active ON account_locks(user_id, locked_until) WHERE locked_until IS NULL OR locked_until > CURRENT_TIMESTAMP;

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_resource ON admin_activity_logs(resource_type, resource_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_severity ON admin_activity_logs(severity) WHERE severity IN ('critical', 'security');

-- Audit and notification indexes
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id) WHERE tenant_id IS NOT NULL;

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at column
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add more triggers as needed...

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE tenants IS 'Multi-tenant SaaS organization management';
COMMENT ON TABLE patients IS 'Patient information and demographics';
COMMENT ON TABLE appointments IS 'Appointment scheduling and management';
COMMENT ON TABLE medical_records IS 'Core medical records for consultations and treatments';
COMMENT ON TABLE prescriptions IS 'Prescription records with medications';
COMMENT ON TABLE medical_reports IS 'Lab reports, imaging reports, and test results';

COMMENT ON COLUMN patients.abha_id IS 'Ayushman Bharat Health Account ID for India';
COMMENT ON COLUMN patients.aadhar_number IS 'Should be encrypted at application level';
COMMENT ON COLUMN patients.pan_number IS 'Should be encrypted at application level';
COMMENT ON COLUMN report_files.is_encrypted IS 'PHI files must be encrypted';
COMMENT ON COLUMN audit_logs.severity IS 'Audit log severity for compliance tracking';
