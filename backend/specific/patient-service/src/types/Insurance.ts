export interface Insurance {
  id: string;
  patientId: string;
  providerName: string;
  policyNumber: string;
  groupNumber?: string;
  policyHolderName: string;
  relationshipToPatient: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  effectiveDate: Date;
  expirationDate?: Date;
  copayAmount?: number;
  deductibleAmount?: number;
  outOfPocketMaximum?: number;
  coveragePercentage?: number;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInsuranceData {
  providerName: string;
  policyNumber: string;
  groupNumber?: string;
  policyHolderName: string;
  relationshipToPatient: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  effectiveDate: Date;
  expirationDate?: Date;
  copayAmount?: number;
  deductibleAmount?: number;
  outOfPocketMaximum?: number;
  coveragePercentage?: number;
  isPrimary: boolean;
}

export interface UpdateInsuranceData {
  providerName?: string;
  policyNumber?: string;
  groupNumber?: string;
  policyHolderName?: string;
  relationshipToPatient?: 'self' | 'spouse' | 'parent' | 'child' | 'other';
  effectiveDate?: Date;
  expirationDate?: Date;
  copayAmount?: number;
  deductibleAmount?: number;
  outOfPocketMaximum?: number;
  coveragePercentage?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

