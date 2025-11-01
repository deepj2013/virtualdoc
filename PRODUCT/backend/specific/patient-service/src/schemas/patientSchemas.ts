import Joi from 'joi';

const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required()
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().required(),
  relationship: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().optional()
});

export const patientSchemas = {
  getPatients: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive', 'archived').optional(),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  createPatient: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    address: addressSchema.optional(),
    emergencyContact: emergencyContactSchema.optional(),
    medicalRecordNumber: Joi.string().optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    medications: Joi.array().items(Joi.string()).optional()
  }),

  getPatient: Joi.object({
    id: Joi.string().uuid().required()
  }),

  updatePatient: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    address: addressSchema.optional(),
    emergencyContact: emergencyContactSchema.optional(),
    medicalRecordNumber: Joi.string().optional(),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    medications: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional()
  }),

  deletePatient: Joi.object({
    id: Joi.string().uuid().required()
  }),

  searchPatients: Joi.object({
    q: Joi.string().min(1).required(),
    filters: Joi.object().optional()
  }),

  advancedSearch: Joi.object({
    query: Joi.string().optional(),
    filters: Joi.object({
      gender: Joi.string().valid('male', 'female', 'other').optional(),
      bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
      ageRange: Joi.object({
        min: Joi.number().integer().min(0).required(),
        max: Joi.number().integer().min(0).required()
      }).optional(),
      hasAllergies: Joi.boolean().optional(),
      isActive: Joi.boolean().optional()
    }).optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  getMedicalHistory: Joi.object({
    id: Joi.string().uuid().required()
  }),

  addMedicalHistory: Joi.object({
    recordType: Joi.string().valid('consultation', 'diagnosis', 'treatment', 'prescription', 'lab_result', 'imaging', 'other').required(),
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(1).required(),
    diagnosis: Joi.string().optional(),
    treatment: Joi.string().optional(),
    medications: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required(),
      duration: Joi.string().required(),
      instructions: Joi.string().optional()
    })).optional(),
    vitalSigns: Joi.object({
      bloodPressure: Joi.object({
        systolic: Joi.number().min(0).required(),
        diastolic: Joi.number().min(0).required()
      }).optional(),
      heartRate: Joi.number().min(0).optional(),
      temperature: Joi.number().min(0).optional(),
      respiratoryRate: Joi.number().min(0).optional(),
      oxygenSaturation: Joi.number().min(0).max(100).optional(),
      weight: Joi.number().min(0).optional(),
      height: Joi.number().min(0).optional(),
      bmi: Joi.number().min(0).optional()
    }).optional(),
    labResults: Joi.array().items(Joi.object({
      testName: Joi.string().required(),
      value: Joi.string().required(),
      unit: Joi.string().required(),
      referenceRange: Joi.string().required(),
      status: Joi.string().valid('normal', 'abnormal', 'critical').required(),
      notes: Joi.string().optional()
    })).optional(),
    imagingResults: Joi.array().items(Joi.object({
      studyType: Joi.string().required(),
      bodyPart: Joi.string().required(),
      findings: Joi.string().required(),
      impression: Joi.string().required(),
      recommendations: Joi.string().optional()
    })).optional(),
    notes: Joi.string().optional(),
    doctorId: Joi.string().uuid().required(),
    doctorName: Joi.string().required(),
    dateOfVisit: Joi.date().max('now').required(),
    followUpDate: Joi.date().min('now').optional()
  }),

  getDemographics: Joi.object({
    id: Joi.string().uuid().required()
  }),

  updateDemographics: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    address: addressSchema.optional(),
    emergencyContact: emergencyContactSchema.optional()
  }),

  getInsurance: Joi.object({
    id: Joi.string().uuid().required()
  }),

  addInsurance: Joi.object({
    providerName: Joi.string().min(1).max(100).required(),
    policyNumber: Joi.string().min(1).max(50).required(),
    groupNumber: Joi.string().max(50).optional(),
    policyHolderName: Joi.string().min(1).max(100).required(),
    relationshipToPatient: Joi.string().valid('self', 'spouse', 'parent', 'child', 'other').required(),
    effectiveDate: Joi.date().max('now').required(),
    expirationDate: Joi.date().min('now').optional(),
    copayAmount: Joi.number().min(0).optional(),
    deductibleAmount: Joi.number().min(0).optional(),
    outOfPocketMaximum: Joi.number().min(0).optional(),
    coveragePercentage: Joi.number().min(0).max(100).optional(),
    isPrimary: Joi.boolean().required()
  }),

  updateInsurance: Joi.object({
    providerName: Joi.string().min(1).max(100).optional(),
    policyNumber: Joi.string().min(1).max(50).optional(),
    groupNumber: Joi.string().max(50).optional(),
    policyHolderName: Joi.string().min(1).max(100).optional(),
    relationshipToPatient: Joi.string().valid('self', 'spouse', 'parent', 'child', 'other').optional(),
    effectiveDate: Joi.date().max('now').optional(),
    expirationDate: Joi.date().min('now').optional(),
    copayAmount: Joi.number().min(0).optional(),
    deductibleAmount: Joi.number().min(0).optional(),
    outOfPocketMaximum: Joi.number().min(0).optional(),
    coveragePercentage: Joi.number().min(0).max(100).optional(),
    isPrimary: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  }),

  deleteInsurance: Joi.object({
    id: Joi.string().uuid().required(),
    insuranceId: Joi.string().uuid().required()
  }),

  getEmergencyContacts: Joi.object({
    id: Joi.string().uuid().required()
  }),

  addEmergencyContact: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    relationship: Joi.string().min(1).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
    email: Joi.string().email().optional(),
    address: addressSchema.optional(),
    isPrimary: Joi.boolean().required()
  }),

  updateEmergencyContact: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    relationship: Joi.string().min(1).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    address: addressSchema.optional(),
    isPrimary: Joi.boolean().optional(),
    isActive: Joi.boolean().optional()
  }),

  deleteEmergencyContact: Joi.object({
    id: Joi.string().uuid().required(),
    contactId: Joi.string().uuid().required()
  }),

  getDocuments: Joi.object({
    id: Joi.string().uuid().required()
  }),

  uploadDocument: Joi.object({
    fileName: Joi.string().min(1).max(255).required(),
    originalFileName: Joi.string().min(1).max(255).required(),
    fileType: Joi.string().min(1).max(50).required(),
    fileSize: Joi.number().min(0).required(),
    filePath: Joi.string().min(1).required(),
    documentType: Joi.string().valid('medical_record', 'prescription', 'lab_result', 'imaging', 'insurance', 'id', 'other').required(),
    description: Joi.string().max(500).optional(),
    uploadedBy: Joi.string().uuid().required()
  }),

  deleteDocument: Joi.object({
    id: Joi.string().uuid().required(),
    documentId: Joi.string().uuid().required()
  }),

  getPatientStatistics: Joi.object({
    id: Joi.string().uuid().required()
  }),

  exportPatient: Joi.object({
    id: Joi.string().uuid().required(),
    format: Joi.string().valid('pdf', 'json', 'csv').default('pdf')
  })
};



