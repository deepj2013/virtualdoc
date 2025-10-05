import express from 'express';
import { PatientController } from '../controllers/PatientController';
import { validateRequest } from '../middleware/validateRequest';
import { patientSchemas } from '../schemas/patientSchemas';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();
const patientController = new PatientController();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients
 *     description: Retrieve a list of patients with optional filtering and pagination
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of patients per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name or ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *         description: Filter by patient status
 *     responses:
 *       200:
 *         description: List of patients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Patients retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     patients:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: 123e4567-e89b-12d3-a456-426614174000
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                           dateOfBirth:
 *                             type: string
 *                             format: date
 *                             example: 1990-01-01
 *                           gender:
 *                             type: string
 *                             enum: [male, female, other]
 *                             example: male
 *                           phoneNumber:
 *                             type: string
 *                             example: +1234567890
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: john.doe@example.com
 *                           status:
 *                             type: string
 *                             enum: [active, inactive, archived]
 *                             example: active
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2024-01-01T00:00:00.000Z
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
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
