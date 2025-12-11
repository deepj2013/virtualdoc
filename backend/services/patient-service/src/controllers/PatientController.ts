import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import PatientService from '../services/PatientService';
import { validateCreatePatient, validateUpdatePatient, validatePatientSearch } from '../validators/patient.validator';

class PatientController {
  /**
   * Create new patient
   * POST /api/patients
   */
  createPatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validateCreatePatient(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Get tenant ID from user (required for patients)
      const tenantId = req.user.tenantId;
      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID is required for patient creation',
        });
        return;
      }

      const patient = await PatientService.createPatient(
        value,
        tenantId,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: {
          patient: {
            id: patient.id,
            tenantId: patient.tenantId,
            patientNumber: patient.patientNumber,
            firstName: patient.firstName,
            lastName: patient.lastName,
            middleName: patient.middleName,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            phone: patient.phone,
            email: patient.email,
            isActive: patient.isActive,
            createdAt: patient.createdAt,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient',
      });
    }
  };

  /**
   * Get patient by ID
   * GET /api/patients/:patientId
   */
  getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { patientId } = req.params;
      const patient = await PatientService.getPatientById(
        patientId,
        req.user.tenantId
      );

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          patient,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get patient',
      });
    }
  };

  /**
   * Update patient
   * PUT /api/patients/:patientId
   */
  updatePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validateUpdatePatient(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { patientId } = req.params;
      const patient = await PatientService.updatePatient(
        patientId,
        value,
        req.user.tenantId
      );

      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: {
          patient,
        },
      });
    } catch (error: any) {
      if (error.message === 'Patient not found or access denied') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update patient',
      });
    }
  };

  /**
   * Delete patient (soft delete)
   * DELETE /api/patients/:patientId
   */
  deletePatient = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { patientId } = req.params;
      await PatientService.deletePatient(patientId, req.user.tenantId);

      res.json({
        success: true,
        message: 'Patient deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Patient not found or access denied') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete patient',
      });
    }
  };

  /**
   * Search patients
   * GET /api/patients/search
   */
  searchPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validatePatientSearch(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await PatientService.searchPatients(
        value,
        req.user.tenantId
      );

      res.json({
        success: true,
        data: {
          patients: result.patients,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search patients',
      });
    }
  };

  /**
   * Get all patients (with pagination)
   * GET /api/patients
   */
  getAllPatients = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validatePatientSearch(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await PatientService.searchPatients(
        value,
        req.user.tenantId
      );

      res.json({
        success: true,
        data: {
          patients: result.patients,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get patients',
      });
    }
  };
}

export default PatientController;

