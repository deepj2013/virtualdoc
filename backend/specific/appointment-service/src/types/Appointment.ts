export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  appointmentType: 'consultation' | 'follow_up' | 'checkup' | 'emergency' | 'telemedicine' | 'other';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  location?: string;
  roomNumber?: string;
  notes?: string;
  reminderSent: boolean;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  parentAppointmentId?: string; // For recurring appointments
  createdBy: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly
  dayOfMonth?: number; // 1-31 for monthly
  endDate?: Date;
  maxOccurrences?: number;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  title: string;
  description?: string;
  appointmentType: 'consultation' | 'follow_up' | 'checkup' | 'emergency' | 'telemedicine' | 'other';
  startTime: Date;
  endTime: Date;
  duration?: number;
  location?: string;
  roomNumber?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  appointmentType?: 'consultation' | 'follow_up' | 'checkup' | 'emergency' | 'telemedicine' | 'other';
  status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  location?: string;
  roomNumber?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
}

export interface AppointmentSearchCriteria {
  patientId?: string;
  doctorId?: string;
  status?: string;
  appointmentType?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  roomNumber?: string;
  isRecurring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  conflictReason?: string;
}

export interface AvailabilityWindow {
  doctorId: string;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  isActive: boolean;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingAppointments: Appointment[];
  suggestedSlots: TimeSlot[];
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}



