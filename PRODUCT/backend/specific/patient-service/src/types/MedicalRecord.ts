export interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: 'consultation' | 'diagnosis' | 'treatment' | 'prescription' | 'lab_result' | 'imaging' | 'other';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  imagingResults?: ImagingResult[];
  notes?: string;
  doctorId: string;
  doctorName: string;
  dateOfVisit: Date;
  followUpDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
}

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

export interface ImagingResult {
  studyType: string;
  bodyPart: string;
  findings: string;
  impression: string;
  recommendations?: string;
}

export interface CreateMedicalRecordData {
  recordType: 'consultation' | 'diagnosis' | 'treatment' | 'prescription' | 'lab_result' | 'imaging' | 'other';
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: Medication[];
  vitalSigns?: VitalSigns;
  labResults?: LabResult[];
  imagingResults?: ImagingResult[];
  notes?: string;
  doctorId: string;
  doctorName: string;
  dateOfVisit: Date;
  followUpDate?: Date;
}

