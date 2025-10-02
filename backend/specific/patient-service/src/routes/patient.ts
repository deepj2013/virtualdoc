import express from 'express';
import { PatientController } from '../controllers/PatientController';
import { validateRequest } from '../middleware/validateRequest';
import { patientSchemas } from '../schemas/patientSchemas';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();
const patientController = new PatientController();

// All routes require authentication
router.use(authenticateToken);

// Patient CRUD operations
router.get('/', 
  validateRequest(patientSchemas.getPatients),
  patientController.getPatients
);

router.post('/', 
  validateRequest(patientSchemas.createPatient),
  patientController.createPatient
);

router.get('/:id', 
  validateRequest(patientSchemas.getPatient),
  patientController.getPatient
);

router.put('/:id', 
  validateRequest(patientSchemas.updatePatient),
  patientController.updatePatient
);

router.delete('/:id', 
  validateRequest(patientSchemas.deletePatient),
  patientController.deletePatient
);

// Patient search and filtering
router.get('/search/query', 
  validateRequest(patientSchemas.searchPatients),
  patientController.searchPatients
);

router.get('/search/advanced', 
  validateRequest(patientSchemas.advancedSearch),
  patientController.advancedSearch
);

// Patient medical history
router.get('/:id/medical-history', 
  validateRequest(patientSchemas.getMedicalHistory),
  patientController.getMedicalHistory
);

router.post('/:id/medical-history', 
  validateRequest(patientSchemas.addMedicalHistory),
  patientController.addMedicalHistory
);

// Patient demographics
router.get('/:id/demographics', 
  validateRequest(patientSchemas.getDemographics),
  patientController.getDemographics
);

router.put('/:id/demographics', 
  validateRequest(patientSchemas.updateDemographics),
  patientController.updateDemographics
);

// Patient insurance information
router.get('/:id/insurance', 
  validateRequest(patientSchemas.getInsurance),
  patientController.getInsurance
);

router.post('/:id/insurance', 
  validateRequest(patientSchemas.addInsurance),
  patientController.addInsurance
);

router.put('/:id/insurance/:insuranceId', 
  validateRequest(patientSchemas.updateInsurance),
  patientController.updateInsurance
);

router.delete('/:id/insurance/:insuranceId', 
  validateRequest(patientSchemas.deleteInsurance),
  patientController.deleteInsurance
);

// Patient emergency contacts
router.get('/:id/emergency-contacts', 
  validateRequest(patientSchemas.getEmergencyContacts),
  patientController.getEmergencyContacts
);

router.post('/:id/emergency-contacts', 
  validateRequest(patientSchemas.addEmergencyContact),
  patientController.addEmergencyContact
);

router.put('/:id/emergency-contacts/:contactId', 
  validateRequest(patientSchemas.updateEmergencyContact),
  patientController.updateEmergencyContact
);

router.delete('/:id/emergency-contacts/:contactId', 
  validateRequest(patientSchemas.deleteEmergencyContact),
  patientController.deleteEmergencyContact
);

// Patient documents
router.get('/:id/documents', 
  validateRequest(patientSchemas.getDocuments),
  patientController.getDocuments
);

router.post('/:id/documents', 
  validateRequest(patientSchemas.uploadDocument),
  patientController.uploadDocument
);

router.delete('/:id/documents/:documentId', 
  validateRequest(patientSchemas.deleteDocument),
  patientController.deleteDocument
);

// Patient statistics
router.get('/:id/statistics', 
  validateRequest(patientSchemas.getPatientStatistics),
  patientController.getPatientStatistics
);

// Patient export
router.get('/:id/export', 
  validateRequest(patientSchemas.exportPatient),
  patientController.exportPatient
);

export { router as patientRoutes };
