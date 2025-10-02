# VirtualDoc - Doctor Dashboard Wireframes

## 🎯 Dashboard Overview

The Doctor Dashboard is the central hub for healthcare providers, designed for efficiency, clarity, and quick access to essential functions.

## 📱 Responsive Design Strategy

- **Desktop**: Full-featured dashboard with sidebar navigation
- **Tablet**: Collapsible sidebar with touch-optimized interface
- **Mobile**: Bottom navigation with essential functions

## 🖥️ Desktop Dashboard Layout

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
│ [Logo] VirtualDoc    [Search] [Notifications] [Profile] [AI]   │
└─────────────────────────────────────────────────────────────────┘
```

**Header Elements:**
- **Logo**: VirtualDoc branding with quick access to home
- **Search**: Global search for patients, appointments, records
- **Notifications**: Real-time alerts and reminders
- **Profile**: User profile and settings dropdown
- **AI Assistant**: Quick access to voice AI features

### Sidebar Navigation

```
┌─────────────┐
│ Dashboard   │
├─────────────┤
│ Patients    │
├─────────────┤
│ Appointments│
├─────────────┤
│ Medical     │
│ Records     │
├─────────────┤
│ Prescriptions│
├─────────────┤
│ Billing     │
├─────────────┤
│ Reports     │
├─────────────┤
│ Settings    │
└─────────────┘
```

## 📊 Main Dashboard Content

### Dashboard Overview Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back, Dr. Sarah                    [Quick Actions]      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Today's     │ │ Pending     │ │ Recent      │ │ AI          │ │
│ │ Appointments│ │ Prescriptions│ │ Patients    │ │ Assistant   │ │
│ │ 8           │ │ 3           │ │ 12          │ │ Ready       │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Today's Schedule                                            │ │
│ │ ┌─────┬─────────────┬─────────────┬─────────────┬─────────┐ │ │
│ │ │Time │ Patient     │ Type        │ Status      │ Actions │ │ │
│ │ ├─────┼─────────────┼─────────────┼─────────────┼─────────┤ │ │
│ │ │9:00 │ John Doe    │ Consultation│ Confirmed   │ [Start] │ │ │
│ │ │10:30│ Jane Smith  │ Follow-up   │ Confirmed   │ [Start] │ │ │
│ │ │2:00 │ Bob Wilson  │ New Patient │ Confirmed   │ [Start] │ │ │
│ │ └─────┴─────────────┴─────────────┴─────────────┴─────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Quick Actions                                              │ │
│ │ [New Patient] [New Appointment] [Voice Note] [Prescription]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 👥 Patient Management Interface

### Patient List View

```
┌─────────────────────────────────────────────────────────────────┐
│ Patients                                    [Search] [Filter] [+]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────┬─────────────┬─────────────┬─────────────┬─────────────┐ │
│ │Photo│ Name        │ DOB         │ Last Visit  │ Actions     │ │
│ ├─────┼─────────────┼─────────────┼─────────────┼─────────────┤ │
│ │[👤] │ John Doe    │ 1985-03-15  │ 2024-01-15  │ [View][Edit]│ │
│ │[👤] │ Jane Smith  │ 1990-07-22  │ 2024-01-14  │ [View][Edit]│ │
│ │[👤] │ Bob Wilson  │ 1978-11-08  │ 2024-01-13  │ [View][Edit]│ │
│ └─────┴─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Patient Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│ John Doe (Patient ID: P001234)                    [Edit][Print] │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│ │ Patient     │ │ Medical History                              │ │
│ │ Info        │ │ ┌─────────────────────────────────────────┐ │ │
│ │ Age: 39     │ │ │ 2024-01-15 - Hypertension              │ │ │
│ │ Gender: M   │ │ │ 2023-12-10 - Annual Checkup            │ │ │
│ │ Phone: ...  │ │ │ 2023-09-05 - Flu Shot                  │ │ │
│ │ Email: ...  │ │ └─────────────────────────────────────────┘ │ │
│ │ Insurance:  │ │                                             │ │
│ │ Blue Cross  │ │ [Add New Record] [View All]                │ │
│ └─────────────┘ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Current Medications                                        │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Lisinopril 10mg - Daily - Since 2024-01-01             │ │ │
│ │ │ Metformin 500mg - Twice Daily - Since 2023-06-15       │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ [Add Medication] [View All]                                │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📅 Appointment Management

### Appointment Calendar View

```
┌─────────────────────────────────────────────────────────────────┐
│ Appointments                    [Month] [Week] [Day] [+ New]    │
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
│ Today's Appointments (January 15, 2024)                        │
│ ┌─────┬─────────────┬─────────────┬─────────────┬─────────────┐ │
│ │Time │ Patient     │ Type        │ Duration    │ Status      │ │
│ ├─────┼─────────────┼─────────────┼─────────────┼─────────────┤ │
│ │9:00 │ John Doe    │ Consultation│ 30 min      │ Confirmed   │ │
│ │10:30│ Jane Smith  │ Follow-up   │ 15 min      │ Confirmed   │ │
│ │2:00 │ Bob Wilson  │ New Patient │ 45 min      │ Confirmed   │ │
│ └─────┴─────────────┴─────────────┴─────────────┴─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Appointment Detail Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Appointment Details                                [Edit][Close]│
├─────────────────────────────────────────────────────────────────┤
│ Patient: John Doe (P001234)                                    │
│ Date: January 15, 2024                                         │
│ Time: 9:00 AM - 9:30 AM                                        │
│ Type: Consultation                                             │
│ Reason: Annual Checkup                                         │
│ Status: Confirmed                                              │
├─────────────────────────────────────────────────────────────────┤
│ Notes:                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Patient reports feeling well, no new symptoms.             │ │
│ │ Blood pressure normal, weight stable.                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Start Consultation] [Reschedule] [Cancel] [Add Notes]         │
└─────────────────────────────────────────────────────────────────┘
```

## 🤖 AI Assistant Interface

### Voice AI Assistant Panel

```
┌─────────────────────────────────────────────────────────────────┐
│ AI Assistant                                    [Settings][Help]│
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🎤 Voice Input                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Patient complains of chest pain and shortness of breath │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ [Listening...] [Stop] [Clear]                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ AI Suggestions                                            │ │
│ │ • Consider cardiac evaluation                             │ │
│ │ • Order ECG and chest X-ray                               │ │
│ │ • Check vital signs                                       │ │
│ │ • Rule out myocardial infarction                          │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [Generate Prescription] [Add to Notes] [Ask Follow-up]         │
└─────────────────────────────────────────────────────────────────┘
```

### Prescription Generation Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ Prescription Generator                          [Templates][Save]│
├─────────────────────────────────────────────────────────────────┤
│ Patient: John Doe (P001234)                                    │
│ Date: January 15, 2024                                         │
│ Doctor: Dr. Sarah Johnson                                      │
├─────────────────────────────────────────────────────────────────┤
│ Medication: [Search or speak medication name]                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Lisinopril 10mg                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ Dosage: [10mg] Frequency: [Daily] Duration: [30 days]          │
│ Instructions: [Take with food, monitor blood pressure]         │
├─────────────────────────────────────────────────────────────────┤
│ Drug Interactions: ✅ No interactions found                    │
│ Allergies: ✅ No known allergies to this medication            │
├─────────────────────────────────────────────────────────────────┤
│ [Add Another Medication] [Generate Prescription] [Save Draft]  │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Dashboard Layout

### Mobile Header

```
┌─────────────────────────────────────────────────────────────────┐
│ [☰] VirtualDoc                    [🔔][👤]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Dashboard Content

```
┌─────────────────────────────────────────────────────────────────┐
│ Welcome Back, Dr. Sarah                                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐                               │
│ │ Today's     │ │ Pending     │                               │
│ │ Appointments│ │ Prescriptions│                               │
│ │ 8           │ │ 3           │                               │
│ └─────────────┘ └─────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐                               │
│ │ Recent      │ │ AI          │                               │
│ │ Patients    │ │ Assistant   │                               │
│ │ 12          │ │ Ready       │                               │
│ └─────────────┘ └─────────────┘                               │
├─────────────────────────────────────────────────────────────────┤
│ Today's Schedule                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 9:00 AM - John Doe - Consultation                          │ │
│ │ 10:30 AM - Jane Smith - Follow-up                          │ │
│ │ 2:00 PM - Bob Wilson - New Patient                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Bottom Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│ [🏠] [👥] [📅] [💊] [📊]                                      │
│ Home  Patients Appts Presc Reports                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #1976d2;
--primary-light: #42a5f5;
--primary-dark: #1565c0;

/* Secondary Colors */
--secondary-red: #dc004e;
--secondary-light: #ff5983;
--secondary-dark: #9a0036;

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
--font-mono: 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Spacing System

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## 🔧 Interactive Elements

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: var(--space-3) var(--space-6);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--primary-blue);
  color: white;
}
```

### Form Elements

```css
/* Input Fields */
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

/* Select Dropdown */
.select-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  background: white;
  font-size: var(--text-base);
  cursor: pointer;
}
```

## 📊 Data Visualization

### Charts and Graphs

```css
/* Chart Container */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: var(--space-6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-6);
}

/* Chart Title */
.chart-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: var(--space-4);
}

/* Chart Legend */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
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

This comprehensive wireframe and design system ensures VirtualDoc provides an intuitive, accessible, and efficient interface for healthcare providers while maintaining the highest standards of usability and design.
