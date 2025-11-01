export interface Document {
  id: string;
  patientId: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  documentType: 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'insurance' | 'id' | 'other';
  description?: string;
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentData {
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  documentType: 'medical_record' | 'prescription' | 'lab_result' | 'imaging' | 'insurance' | 'id' | 'other';
  description?: string;
  uploadedBy: string;
}

