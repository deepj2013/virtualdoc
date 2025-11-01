# Database Schema - Video Calling & Meeting Management Module

## 🎥 Overview
Comprehensive video calling and meeting management system supporting doctor-patient consultations, team meetings, and guest access.

---

## VIDEO CALLING & MEETING MODULE

### video_call_sessions
Video call and meeting sessions
```sql
CREATE TABLE video_call_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'consultation', 'team_meeting', 'training', 'conference', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Host/organizer
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- If linked to appointment
    scheduled_start TIMESTAMP NOT NULL,
    scheduled_end TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    duration_minutes INTEGER,
    meeting_room_id VARCHAR(255) UNIQUE NOT NULL, -- Unique room identifier
    meeting_room_password VARCHAR(100), -- Optional password for room
    meeting_url TEXT NOT NULL, -- Main meeting URL
    host_url TEXT NOT NULL, -- Host-specific URL
    guest_link TEXT UNIQUE NOT NULL, -- Public guest link
    guest_link_expires_at TIMESTAMP, -- When guest link expires (optional)
    max_participants INTEGER DEFAULT 100,
    is_recording_enabled BOOLEAN DEFAULT false,
    recording_url TEXT, -- URL to recorded session
    is_live BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'cancelled', 'ended'
    meeting_provider VARCHAR(50) DEFAULT 'custom', -- 'zoom', 'jitsi', 'custom', 'twilio', 'aws_chime'
    provider_session_id VARCHAR(255), -- Provider's session ID
    waiting_room_enabled BOOLEAN DEFAULT true, -- Require approval before joining
    chat_enabled BOOLEAN DEFAULT true,
    screen_sharing_enabled BOOLEAN DEFAULT true,
    mute_on_entry BOOLEAN DEFAULT false,
    auto_record BOOLEAN DEFAULT false,
    settings JSONB, -- Additional meeting settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_participants
Participants in video call sessions
```sql
CREATE TABLE video_call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if guest
    participant_type VARCHAR(50) NOT NULL, -- 'host', 'co_host', 'participant', 'guest', 'panelist'
    participant_name VARCHAR(255) NOT NULL, -- Name to display
    email VARCHAR(255), -- For guests or participants without user account
    phone VARCHAR(20), -- For phone dial-in
    is_guest BOOLEAN DEFAULT false, -- True if accessed via guest link
    guest_token VARCHAR(255) UNIQUE, -- Unique token for guest access
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'joined', 'left', 'rejected', 'removed'
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet', 'phone'
    ip_address VARCHAR(45),
    user_agent TEXT,
    audio_enabled BOOLEAN DEFAULT true,
    video_enabled BOOLEAN DEFAULT true,
    screen_shared BOOLEAN DEFAULT false,
    is_muted BOOLEAN DEFAULT false,
    is_on_hold BOOLEAN DEFAULT false,
    waiting_room_admitted_at TIMESTAMP, -- When admitted from waiting room
    admitted_by UUID REFERENCES users(id), -- Who admitted from waiting room
    connection_quality VARCHAR(20), -- 'excellent', 'good', 'fair', 'poor'
    meeting_role VARCHAR(50), -- Role in meeting (doctor, patient, observer, etc.)
    invitation_sent_at TIMESTAMP,
    invitation_method VARCHAR(50), -- 'email', 'sms', 'whatsapp', 'in_app', 'guest_link'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_invitations
Meeting invitations sent to participants
```sql
CREATE TABLE video_call_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    invited_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if guest
    invited_email VARCHAR(255),
    invited_phone VARCHAR(20),
    invitation_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'whatsapp', 'in_app', 'guest_link'
    invitation_token VARCHAR(255) UNIQUE, -- Unique token for invitation
    invitation_url TEXT, -- Specific invitation URL
    sent_by UUID REFERENCES users(id),
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'accepted', 'declined', 'failed'
    opened_at TIMESTAMP,
    responded_at TIMESTAMP,
    response VARCHAR(50), -- 'accepted', 'declined', 'tentative'
    reminder_sent BOOLEAN DEFAULT false,
    last_reminder_sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_recordings
Recordings of video call sessions
```sql
CREATE TABLE video_call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    recording_type VARCHAR(50) NOT NULL, -- 'full', 'audio_only', 'screen_only', 'transcript'
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT, -- Public/private URL to recording
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    format VARCHAR(50), -- 'mp4', 'mp3', 'webm', 'transcript'
    storage_provider VARCHAR(50) DEFAULT 's3', -- 's3', 'azure', 'gcs', 'local'
    storage_bucket VARCHAR(255),
    is_encrypted BOOLEAN DEFAULT true,
    encryption_key_id VARCHAR(255),
    access_level VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'restricted', 'patients_only'
    transcribed BOOLEAN DEFAULT false,
    transcript_url TEXT, -- URL to transcript file
    transcription_status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
    recording_start TIMESTAMP NOT NULL,
    recording_end TIMESTAMP NOT NULL,
    recording_status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'deleted'
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP,
    deleted_at TIMESTAMP,
    retention_days INTEGER DEFAULT 365, -- Days to retain recording
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_chat_messages
Chat messages during video calls
```sql
CREATE TABLE video_call_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if guest
    sender_name VARCHAR(255) NOT NULL,
    sender_type VARCHAR(50), -- 'host', 'participant', 'guest'
    message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'file', 'image', 'system'
    message_content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    is_private BOOLEAN DEFAULT false, -- Private message to specific user
    recipient_id UUID REFERENCES users(id) ON DELETE SET NULL, -- For private messages
    recipient_email VARCHAR(255), -- For private messages to guests
    is_pinned BOOLEAN DEFAULT false,
    pinned_by UUID REFERENCES users(id),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    read_by TEXT[], -- Array of user IDs/emails who read the message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_analytics
Analytics and metrics for video calls
```sql
CREATE TABLE video_call_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
    participant_id UUID REFERENCES video_call_participants(id) ON DELETE SET NULL,
    metric_type VARCHAR(100) NOT NULL, -- 'connection_quality', 'bandwidth', 'latency', 'packet_loss', 'device_info'
    metric_value TEXT, -- JSON value for complex metrics
    metric_unit VARCHAR(50), -- 'ms', 'kbps', 'percentage', etc.
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### video_call_settings
Default settings for video calls per tenant/user
```sql
CREATE TABLE video_call_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    setting_type VARCHAR(50) NOT NULL, -- 'default_meeting_settings', 'user_preferences'
    default_duration_minutes INTEGER DEFAULT 60,
    default_max_participants INTEGER DEFAULT 100,
    auto_record BOOLEAN DEFAULT false,
    waiting_room_enabled BOOLEAN DEFAULT true,
    mute_on_entry BOOLEAN DEFAULT false,
    require_password BOOLEAN DEFAULT false,
    default_password VARCHAR(100),
    guest_link_enabled BOOLEAN DEFAULT true,
    guest_link_expires_hours INTEGER, -- NULL for no expiration
    require_registration BOOLEAN DEFAULT false,
    provider VARCHAR(50) DEFAULT 'custom',
    settings JSONB, -- Additional custom settings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id, setting_type)
);
```

---

## INDEXES FOR PERFORMANCE

```sql
-- Video call sessions indexes
CREATE INDEX idx_video_call_sessions_tenant ON video_call_sessions(tenant_id);
CREATE INDEX idx_video_call_sessions_organizer ON video_call_sessions(organizer_id);
CREATE INDEX idx_video_call_sessions_appointment ON video_call_sessions(appointment_id);
CREATE INDEX idx_video_call_sessions_room_id ON video_call_sessions(meeting_room_id);
CREATE INDEX idx_video_call_sessions_guest_link ON video_call_sessions(guest_link);
CREATE INDEX idx_video_call_sessions_status ON video_call_sessions(status);
CREATE INDEX idx_video_call_sessions_scheduled_start ON video_call_sessions(scheduled_start);

-- Participants indexes
CREATE INDEX idx_participants_session ON video_call_participants(session_id);
CREATE INDEX idx_participants_user ON video_call_participants(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_participants_guest_token ON video_call_participants(guest_token);
CREATE INDEX idx_participants_status ON video_call_participants(status);

-- Invitations indexes
CREATE INDEX idx_invitations_session ON video_call_invitations(session_id);
CREATE INDEX idx_invitations_user ON video_call_invitations(invited_user_id) WHERE invited_user_id IS NOT NULL;
CREATE INDEX idx_invitations_email ON video_call_invitations(invited_email);
CREATE INDEX idx_invitations_token ON video_call_invitations(invitation_token);
CREATE INDEX idx_invitations_status ON video_call_invitations(status);

-- Recordings indexes
CREATE INDEX idx_recordings_session ON video_call_recordings(session_id);
CREATE INDEX idx_recordings_status ON video_call_recordings(recording_status);
CREATE INDEX idx_recordings_access_level ON video_call_recordings(access_level);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_session ON video_call_chat_messages(session_id);
CREATE INDEX idx_chat_messages_sender ON video_call_chat_messages(sender_id) WHERE sender_id IS NOT NULL;
CREATE INDEX idx_chat_messages_created ON video_call_chat_messages(created_at DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_session ON video_call_analytics(session_id);
CREATE INDEX idx_analytics_participant ON video_call_analytics(participant_id) WHERE participant_id IS NOT NULL;
CREATE INDEX idx_analytics_recorded_at ON video_call_analytics(recorded_at);
```

---

## FEATURES SUPPORTED

✅ Doctor-patient video consultations
✅ Team meetings and conferences
✅ Guest link generation for public access
✅ Host and co-host roles
✅ Waiting room functionality
✅ Meeting recording and transcription
✅ Chat messaging during calls
✅ Screen sharing
✅ Participant management
✅ Invitation system (Email, SMS, WhatsApp, In-app)
✅ Guest access without account
✅ Meeting analytics and metrics
✅ Recording retention and access control
✅ Custom meeting settings per tenant/user
✅ Multiple provider support (Zoom, Jitsi, Twilio, AWS Chime, Custom)

---

## USAGE EXAMPLES

### Creating a Doctor-Patient Consultation
```sql
-- Create video call session for appointment
INSERT INTO video_call_sessions (
    tenant_id,
    session_type,
    title,
    organizer_id,
    appointment_id,
    scheduled_start,
    scheduled_end,
    meeting_room_id,
    meeting_url,
    host_url,
    guest_link,
    max_participants
) VALUES (
    'tenant-uuid',
    'consultation',
    'Consultation with Dr. Smith',
    'doctor-user-uuid',
    'appointment-uuid',
    '2024-01-15 10:00:00',
    '2024-01-15 10:30:00',
    'room-' || gen_random_uuid(),
    'https://meet.virtualdoc.com/room-xxx',
    'https://meet.virtualdoc.com/room-xxx?host=true',
    'https://meet.virtualdoc.com/guest/room-xxx/token-abc123',
    2
);

-- Add patient as participant with guest access
INSERT INTO video_call_participants (
    session_id,
    user_id,
    participant_type,
    participant_name,
    is_guest,
    guest_token,
    status
) VALUES (
    'session-uuid',
    'patient-user-uuid',
    'participant',
    'John Doe',
    true,
    'token-abc123',
    'invited'
);
```

### Creating a Team Meeting with Guest Links
```sql
-- Create team meeting
INSERT INTO video_call_sessions (
    tenant_id,
    session_type,
    title,
    organizer_id,
    scheduled_start,
    meeting_room_id,
    meeting_url,
    host_url,
    guest_link,
    guest_link_expires_at,
    max_participants,
    waiting_room_enabled,
    chat_enabled,
    screen_sharing_enabled
) VALUES (
    'tenant-uuid',
    'team_meeting',
    'Weekly Team Standup',
    'manager-uuid',
    '2024-01-15 14:00:00',
    'room-team-' || gen_random_uuid(),
    'https://meet.virtualdoc.com/room-team-xxx',
    'https://meet.virtualdoc.com/room-team-xxx?host=true',
    'https://meet.virtualdoc.com/guest/room-team-xxx/token-xyz789',
    '2024-01-15 18:00:00', -- Expires 4 hours after start
    50,
    true,
    true,
    true
);
```

---

This module integrates seamlessly with the existing telemedicine_consultations table and extends it with comprehensive meeting management capabilities.
