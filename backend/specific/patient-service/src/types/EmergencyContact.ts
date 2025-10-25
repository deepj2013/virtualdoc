export interface EmergencyContact {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: Address;
  isPrimary: boolean;
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

export interface CreateEmergencyContactData {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: Address;
  isPrimary: boolean;
}

export interface UpdateEmergencyContactData {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  address?: Address;
  isPrimary?: boolean;
  isActive?: boolean;
}

