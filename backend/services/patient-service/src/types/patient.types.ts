export interface Patient {
  id: string;
  tenantId: string;
  userId: string | null;
  patientNumber: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string | null;
  heightCm: number | null;
  weightKg: number | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  abhaId: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  abhaId?: string;
  aadharNumber?: string;
  panNumber?: string;
}

export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  abhaId?: string;
  aadharNumber?: string;
  panNumber?: string;
  isActive?: boolean;
}

export interface PatientSearchParams {
  search?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  city?: string;
  state?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

