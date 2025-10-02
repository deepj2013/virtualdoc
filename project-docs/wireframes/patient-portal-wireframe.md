# VirtualDoc - Patient Portal Wireframes

## 🎯 Patient Portal Overview

The Patient Portal provides patients with easy access to their healthcare information, appointment scheduling, and communication with their healthcare providers.

## 📱 Responsive Design Strategy

- **Desktop**: Full-featured portal with sidebar navigation
- **Tablet**: Optimized for touch with collapsible navigation
- **Mobile**: Bottom navigation with essential functions

## 🖥️ Desktop Patient Portal Layout

### Main Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ Header Bar                                                      │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│ Sidebar     │ Main Content Area                                 │
│ Navigation  │                                                   │
│             │                                                   │
│             │                                                   │
│             │                                                   │
│             │                                                   │
│             │                                                   │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### Header Bar Components

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] VirtualDoc Patient Portal    [Notifications] [Profile]   │
└─────────────────────────────────────────────────────────────────┘
```

**Header Elements:**
- **Logo**: VirtualDoc branding with link to home
- **Notifications**: Appointment reminders and messages
- **Profile**: Patient profile and settings dropdown

### Sidebar Navigation

```
┌─────────────┐
│ Dashboard   │
├─────────────┤
│ Appointments│
├─────────────┤
│ Medical     │
│ Records     │
├─────────────┤
│ Prescriptions│
├─────────────┤
│ Messages    │
├─────────────┤
│ Billing     │
├─────────────┤
│ Profile     │
└─────────────┘
```

## 📊 Patient Dashboard

### Dashboard Overview Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back, John!                        [Quick Actions]      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Next        │ │ Prescriptions│ │ Test        │ │ Messages    │ │
│ │ Appointment │ │ Due          │ │ Results     │ │ Unread      │ │
│ │ Jan 20, 2PM │ │ 2            │ │ 1 New       │ │ 3           │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Upcoming Appointments                                       │ │
│ │ ┌─────┬─────────────┬─────────────┬─────────────┬─────────┐ │ │
│ │ │Date │ Doctor      │ Type        │ Time        │ Actions │ │ │
│ │ ├─────┼─────────────┼─────────────┼─────────────┼─────────┤ │ │
│ │ │Jan20│ Dr. Sarah   │ Follow-up   │ 2:00 PM     │ [View]  │ │ │
│ │ │Feb15│ Dr. Sarah   │ Annual      │ 10:30 AM    │ [View]  │ │ │
│ │ └─────┴─────────────┴─────────────┴─────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                              │ │
│ │ [Book Appointment] [Message Doctor] [View Records] [Pay Bill]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📅 Appointment Management

### Appointment Booking Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ Book New Appointment                            [Cancel][Save]  │
├─────────────────────────────────────────────────────────────────┤
│ Step 1 of 3: Select Doctor                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐ Dr. Sarah Johnson                          │ │
│ │ │     [👩‍⚕️]    │ Family Medicine                           │ │
│ │ │             │ Available: Mon-Fri 9AM-5PM                 │ │
│ │ └─────────────┘ [Select]                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ┌─────────────┐ Dr. Michael Chen                           │ │
│ │ │     [👨‍⚕️]    │ Cardiology                                │ │
│ │ │             │ Available: Tue-Thu 8AM-4PM                 │ │
│ │ └─────────────┘ [Select]                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Previous] [Next: Select Date & Time]                          │
└─────────────────────────────────────────────────────────────────┘
```

### Appointment Calendar

```
┌─────────────────────────────────────────────────────────────────┐
│ Select Date & Time (Step 2 of 3)                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐                   │
│ │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │                   │
│ ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤                   │
│ │     │     │     │     │     │     │     │                   │
│ │     │     │     │     │     │     │     │                   │
│ │     │     │     │     │     │     │     │                   │
│ │     │     │     │     │     │     │     │                   │
│ │     │     │     │     │     │     │     │                   │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘                   │
├─────────────────────────────────────────────────────────────────┤
│ Available Times for January 20, 2024                           │
│ ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐   │
│ │ 9:00 AM │ 9:30 AM │ 10:00 AM│ 10:30 AM│ 2:00 PM │ 2:30 PM │   │
│ │ [Book]  │ [Book]  │ [Book]  │ [Book]  │ [Book]  │ [Book]  │   │
│ └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Appointment Details

```
┌─────────────────────────────────────────────────────────────────┐
│ Appointment Details                                [Edit][Cancel]│
├─────────────────────────────────────────────────────────────────┤
│ Doctor: Dr. Sarah Johnson                                      │
│ Date: January 20, 2024                                         │
│ Time: 2:00 PM - 2:30 PM                                        │
│ Type: Follow-up Consultation                                   │
│ Location: VirtualDoc Clinic, Room 101                          │
│ Status: Confirmed                                              │
├─────────────────────────────────────────────────────────────────┤
│ Reason for Visit:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Follow-up on blood pressure medication                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Reschedule] [Cancel] [Add to Calendar] [Get Directions]       │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Medical Records

### Medical Records Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Medical Records                                    [Download All]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recent Records                                             │ │
│ │ ┌─────┬─────────────┬─────────────┬─────────────┬─────────┐ │ │
│ │ │Date │ Type        │ Doctor      │ Description │ Actions │ │ │
│ │ ├─────┼─────────────┼─────────────┼─────────────┼─────────┤ │ │
│ │ │Jan15│ Consultation│ Dr. Sarah   │ Annual Check│ [View]  │ │ │
│ │ │Dec10│ Lab Results │ Dr. Sarah   │ Blood Work  │ [View]  │ │ │
│ │ │Nov05│ Prescription│ Dr. Sarah   │ Medication  │ [View]  │ │ │
│ │ └─────┴─────────────┴─────────────┴─────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Record Categories                                          │ │
│ │ [All] [Consultations] [Lab Results] [Prescriptions] [Images]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Medical Record Detail

```
┌─────────────────────────────────────────────────────────────────┐
│ Consultation Record - January 15, 2024              [Print][PDF]│
├─────────────────────────────────────────────────────────────────┤
│ Doctor: Dr. Sarah Johnson                                      │
│ Date: January 15, 2024                                         │
│ Time: 2:00 PM - 2:30 PM                                        │
│ Type: Annual Checkup                                           │
├─────────────────────────────────────────────────────────────────┤
│ Chief Complaint:                                               │
│ Annual checkup and blood pressure follow-up                    │
├─────────────────────────────────────────────────────────────────┤
│ Vital Signs:                                                   │
│ Blood Pressure: 120/80 mmHg                                    │
│ Heart Rate: 72 bpm                                             │
│ Temperature: 98.6°F                                            │
│ Weight: 175 lbs                                                │
├─────────────────────────────────────────────────────────────────┤
│ Assessment:                                                     │
│ Blood pressure well controlled on current medication.          │
│ No new concerns. Continue current treatment plan.              │
├─────────────────────────────────────────────────────────────────┤
│ Plan:                                                          │
│ • Continue Lisinopril 10mg daily                              │
│ • Follow up in 6 months                                        │
│ • Annual lab work ordered                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 💊 Prescription Management

### Prescription List

```
┌─────────────────────────────────────────────────────────────────┐
│ Current Prescriptions                            [Request Refill]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Active Prescriptions                                       │ │
│ │ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │ │
│ │ │ Medication  │ Dosage      │ Next Refill │ Actions     │   │ │
│ │ ├─────────────┼─────────────┼─────────────┼─────────────┤   │ │
│ │ │ Lisinopril  │ 10mg daily  │ Feb 15, 2024│ [Refill]    │   │ │
│ │ │ Metformin   │ 500mg 2x/day│ Feb 10, 2024│ [Refill]    │   │ │
│ │ └─────────────┴─────────────┴─────────────┴─────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Prescription History                                       │ │
│ │ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │ │
│ │ │ Medication  │ Prescribed  │ Status      │ Actions     │   │ │
│ │ ├─────────────┼─────────────┼─────────────┼─────────────┤   │ │
│ │ │ Amoxicillin │ Dec 1, 2023 │ Completed   │ [View]      │   │ │
│ │ │ Ibuprofen   │ Nov 15, 2023│ Completed   │ [View]      │   │ │
│ │ └─────────────┴─────────────┴─────────────┴─────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Prescription Detail

```
┌─────────────────────────────────────────────────────────────────┐
│ Prescription Details - Lisinopril 10mg              [Print][PDF]│
├─────────────────────────────────────────────────────────────────┤
│ Prescribed by: Dr. Sarah Johnson                               │
│ Date: January 15, 2024                                         │
│ Prescription #: RX123456789                                    │
├─────────────────────────────────────────────────────────────────┤
│ Medication: Lisinopril 10mg                                    │
│ Dosage: Take 1 tablet by mouth once daily                     │
│ Quantity: 30 tablets                                           │
│ Refills: 5 refills remaining                                   │
│ Expires: January 15, 2025                                      │
├─────────────────────────────────────────────────────────────────┤
│ Instructions:                                                  │
│ Take with or without food. Monitor blood pressure regularly.   │
│ Contact doctor if experiencing dizziness or persistent cough.  │
├─────────────────────────────────────────────────────────────────┤
│ Pharmacy: CVS Pharmacy - 123 Main St                           │
│ Status: Active                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Request Refill] [Transfer Pharmacy] [Contact Doctor]          │
└─────────────────────────────────────────────────────────────────┘
```

## 💬 Messaging System

### Message List

```
┌─────────────────────────────────────────────────────────────────┐
│ Messages                                        [New Message]   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recent Messages                                            │ │
│ │ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │ │
│ │ │ From        │ Subject     │ Date        │ Status      │   │ │
│ │ ├─────────────┼─────────────┼─────────────┼─────────────┤   │ │
│ │ │ Dr. Sarah   │ Lab Results │ Jan 16, 2024│ Unread      │   │ │
│ │ │ Dr. Sarah   │ Appointment │ Jan 14, 2024│ Read        │   │ │
│ │ │ System      │ Reminder    │ Jan 13, 2024│ Read        │   │ │
│ │ └─────────────┴─────────────┴─────────────┴─────────────┘   │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Message Detail

```
┌─────────────────────────────────────────────────────────────────┐
│ Message from Dr. Sarah Johnson                    [Reply][Close]│
├─────────────────────────────────────────────────────────────────┤
│ Subject: Lab Results Available                                  │
│ Date: January 16, 2024 at 3:45 PM                              │
├─────────────────────────────────────────────────────────────────┤
│ Hi John,                                                        │
│                                                                 │
│ Your recent lab results are now available in your patient      │
│ portal. Your blood work looks great! All values are within     │
│ normal range.                                                   │
│                                                                 │
│ Please continue taking your medication as prescribed and        │
│ schedule your next appointment for 6 months from now.          │
│                                                                 │
│ If you have any questions, please don't hesitate to reach out. │
│                                                                 │
│ Best regards,                                                   │
│ Dr. Sarah Johnson                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Reply] [Mark as Read] [Forward] [Delete]                       │
└─────────────────────────────────────────────────────────────────┘
```

## 💰 Billing and Payments

### Billing Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Billing & Payments                              [Pay All Bills] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Outstanding │ │ Paid This    │ │ Next        │ │ Payment     │ │
│ │ Balance     │ │ Month        │ │ Due Date    │ │ Method      │ │
│ │ $245.50     │ │ $180.00      │ │ Feb 15      │ │ Visa ****1234│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Recent Bills                                               │ │
│ │ ┌─────┬─────────────┬─────────────┬─────────────┬─────────┐ │ │
│ │ │Date │ Description │ Amount      │ Status      │ Actions │ │ │
│ │ ├─────┼─────────────┼─────────────┼─────────────┼─────────┤ │ │
│ │ │Jan15│ Consultation│ $150.00     │ Paid        │ [View]  │ │ │
│ │ │Jan10│ Lab Work    │ $95.50      │ Outstanding │ [Pay]   │ │ │
│ │ └─────┴─────────────┴─────────────┴─────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Payment Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ Payment - Lab Work (January 10, 2024)          [Cancel][Pay]   │
├─────────────────────────────────────────────────────────────────┤
│ Amount: $95.50                                                  │
│ Description: Blood work and urinalysis                          │
│ Date: January 10, 2024                                         │
├─────────────────────────────────────────────────────────────────┤
│ Payment Method:                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💳 Visa ending in 1234                                     │ │
│ │ Expires 12/25                                              │ │
│ │ [Change Payment Method]                                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ Billing Address:                                                │
│ John Doe                                                        │
│ 123 Main Street                                                │
│ Anytown, ST 12345                                              │
│ [Edit Address]                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ I agree to the terms and conditions                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Cancel] [Pay $95.50]                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Patient Portal

### Mobile Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [☰] VirtualDoc Patient Portal              [🔔][👤]            │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back, John!                                            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐                               │
│ │ Next        │ │ Prescriptions│                               │
│ │ Appointment │ │ Due          │                               │
│ │ Jan 20, 2PM │ │ 2            │                               │
│ └─────────────┘ └─────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐                               │
│ │ Test        │ │ Messages    │                               │
│ │ Results     │ │ Unread      │                               │
│ │ 1 New       │ │ 3           │                               │
│ └─────────────┘ └─────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│ Upcoming Appointments                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Jan 20 - Dr. Sarah - Follow-up - 2:00 PM                   │ │
│ │ Feb 15 - Dr. Sarah - Annual - 10:30 AM                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Bottom Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│ [🏠] [📅] [💊] [💬] [👤]                                      │
│ Home  Appts Presc Msgs Profile                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Patient Portal Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #1976d2;
--primary-light: #42a5f5;
--primary-dark: #1565c0;

/* Secondary Colors */
--secondary-green: #4caf50;
--secondary-light: #81c784;
--secondary-dark: #388e3c;

/* Neutral Colors */
--gray-50: #fafafa;
--gray-100: #f5f5f5;
--gray-200: #eeeeee;
--gray-300: #e0e0e0;
--gray-400: #bdbdbd;
--gray-500: #9e9e9e;
--gray-600: #757575;
--gray-700: #616161;
--gray-800: #424242;
--gray-900: #212121;

/* Status Colors */
--success: #4caf50;
--warning: #ff9800;
--error: #f44336;
--info: #2196f3;
```

### Typography

```css
/* Font Families */
--font-primary: 'Roboto', sans-serif;
--font-secondary: 'Open Sans', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

## 🔧 Interactive Elements

### Cards

```css
.card {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-4);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
}

.card-content {
  color: var(--gray-600);
  line-height: 1.6;
}
```

### Status Indicators

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: 20px;
  font-size: var(--text-sm);
  font-weight: 500;
}

.status-confirmed {
  background: #e8f5e8;
  color: #2e7d32;
}

.status-pending {
  background: #fff3e0;
  color: #f57c00;
}

.status-cancelled {
  background: #ffebee;
  color: #c62828;
}
```

## 📊 Data Visualization

### Progress Indicators

```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-blue);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-top: var(--space-2);
}
```

### Charts

```css
.chart-container {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-6);
}

.chart-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
}
```

## 🎯 Accessibility Features

### Keyboard Navigation

- **Tab Order**: Logical tab sequence through all interactive elements
- **Focus Indicators**: Clear visual focus indicators
- **Skip Links**: Quick navigation to main content
- **Keyboard Shortcuts**: Common actions accessible via keyboard

### Screen Reader Support

- **ARIA Labels**: Descriptive labels for all interactive elements
- **Semantic HTML**: Proper use of HTML5 semantic elements
- **Alt Text**: Descriptive alt text for all images
- **Live Regions**: Dynamic content updates announced to screen readers

### Visual Accessibility

- **Color Contrast**: WCAG AA compliant color contrast ratios
- **Font Sizing**: Scalable text that works at 200% zoom
- **Focus Management**: Clear focus indicators and management
- **Motion**: Respects user's motion preferences

This comprehensive patient portal wireframe ensures VirtualDoc provides an intuitive, accessible, and user-friendly interface for patients while maintaining the highest standards of usability and design.
