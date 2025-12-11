import { Router } from 'express';
import PatientController from '../controllers/PatientController';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole, requireTenantAccess } from '../middleware/rbac.middleware';

const router = Router();
const patientController = new PatientController();

/**
 * @route   POST /api/patients
 * @desc    Create new patient
 * @access  Protected (Doctor, Nurse, Staff, Admin)
 */
router.post(
  '/',
  authenticate,
  requireTenantAccess,
  requireRole('doctor', 'nurse', 'staff', 'super_admin', 'admin', 'sub_admin', 'receptionist'),
  patientController.createPatient
);

/**
 * @route   GET /api/patients
 * @desc    Get all patients with pagination
 * @access  Protected
 */
router.get(
  '/',
  authenticate,
  requireTenantAccess,
  patientController.getAllPatients
);

/**
 * @route   GET /api/patients/search
 * @desc    Search patients
 * @access  Protected
 */
router.get(
  '/search',
  authenticate,
  requireTenantAccess,
  patientController.searchPatients
);

/**
 * @route   GET /api/patients/:patientId
 * @desc    Get patient by ID
 * @access  Protected
 */
router.get(
  '/:patientId',
  authenticate,
  requireTenantAccess,
  patientController.getPatientById
);

/**
 * @route   PUT /api/patients/:patientId
 * @desc    Update patient
 * @access  Protected (Doctor, Nurse, Staff, Admin)
 */
router.put(
  '/:patientId',
  authenticate,
  requireTenantAccess,
  requireRole('doctor', 'nurse', 'staff', 'super_admin', 'admin', 'sub_admin', 'receptionist'),
  patientController.updatePatient
);

/**
 * @route   DELETE /api/patients/:patientId
 * @desc    Delete patient (soft delete)
 * @access  Protected (Admin only)
 */
router.delete(
  '/:patientId',
  authenticate,
  requireTenantAccess,
  requireRole('super_admin', 'admin', 'sub_admin'),
  patientController.deletePatient
);

export default router;

