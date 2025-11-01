export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phoneNumber?: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContactInfo;
  medicalRecordNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  phoneNumber?: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContactInfo;
  medicalRecordNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  phoneNumber?: string;
  email?: string;
  address?: Address;
  emergencyContact?: EmergencyContactInfo;
  medicalRecordNumber?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  isActive?: boolean;
}

export interface SearchCriteria {
  query?: string;
  filters?: {
    gender?: string;
    bloodType?: string;
    ageRange?: {
      min: number;
      max: number;
    };
    hasAllergies?: boolean;
    isActive?: boolean;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

