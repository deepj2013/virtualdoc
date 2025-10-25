import { Request, Response } from 'express';
import { PatientService } from '../services/PatientService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/ApiResponse';

export class PatientController {
  private patientService: PatientService;

  constructor() {
    this.patientService = new PatientService();
  }

  public getPatients = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const result = await this.patientService.getPatients({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      const response: ApiResponse = {
        success: true,
        message: 'Patients retrieved successfully',
        data: {
          patients: result.patients,
          pagination: result.pagination
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get patients error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve patients',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getPatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const patient = await this.patientService.getPatientById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Patient retrieved successfully',
        data: { patient }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get patient error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve patient',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(404).json(response);
    }
  };

  public createPatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const patientData = req.body;
      
      const patient = await this.patientService.createPatient(patientData);

      const response: ApiResponse = {
        success: true,
        message: 'Patient created successfully',
        data: { patient }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Create patient error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create patient',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public updatePatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const patient = await this.patientService.updatePatient(id, updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Patient updated successfully',
        data: { patient }
      };

      res.json(response);
    } catch (error) {
      logger.error('Update patient error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update patient',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public deletePatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.patientService.deletePatient(id);

      const response: ApiResponse = {
        success: true,
        message: 'Patient deleted successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Delete patient error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete patient',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public searchPatients = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q, filters } = req.query;
      
      const patients = await this.patientService.searchPatients({
        query: q as string,
        filters: filters ? JSON.parse(filters as string) : {}
      });

      const response: ApiResponse = {
        success: true,
        message: 'Search completed successfully',
        data: { patients }
      };

      res.json(response);
    } catch (error) {
      logger.error('Search patients error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to search patients',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public advancedSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchCriteria = req.body;
      
      const result = await this.patientService.advancedSearch(searchCriteria);

      const response: ApiResponse = {
        success: true,
        message: 'Advanced search completed successfully',
        data: result
      };

      res.json(response);
    } catch (error) {
      logger.error('Advanced search error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to perform advanced search',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public getMedicalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const medicalHistory = await this.patientService.getMedicalHistory(id);

      const response: ApiResponse = {
        success: true,
        message: 'Medical history retrieved successfully',
        data: { medicalHistory }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get medical history error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve medical history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public addMedicalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const historyData = req.body;
      
      const medicalRecord = await this.patientService.addMedicalHistory(id, historyData);

      const response: ApiResponse = {
        success: true,
        message: 'Medical history added successfully',
        data: { medicalRecord }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Add medical history error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to add medical history',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getDemographics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const demographics = await this.patientService.getDemographics(id);

      const response: ApiResponse = {
        success: true,
        message: 'Demographics retrieved successfully',
        data: { demographics }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get demographics error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve demographics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public updateDemographics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const demographicsData = req.body;
      
      const demographics = await this.patientService.updateDemographics(id, demographicsData);

      const response: ApiResponse = {
        success: true,
        message: 'Demographics updated successfully',
        data: { demographics }
      };

      res.json(response);
    } catch (error) {
      logger.error('Update demographics error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update demographics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getInsurance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const insurance = await this.patientService.getInsurance(id);

      const response: ApiResponse = {
        success: true,
        message: 'Insurance information retrieved successfully',
        data: { insurance }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get insurance error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve insurance information',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public addInsurance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const insuranceData = req.body;
      
      const insurance = await this.patientService.addInsurance(id, insuranceData);

      const response: ApiResponse = {
        success: true,
        message: 'Insurance information added successfully',
        data: { insurance }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Add insurance error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to add insurance information',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public updateInsurance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, insuranceId } = req.params;
      const insuranceData = req.body;
      
      const insurance = await this.patientService.updateInsurance(id, insuranceId, insuranceData);

      const response: ApiResponse = {
        success: true,
        message: 'Insurance information updated successfully',
        data: { insurance }
      };

      res.json(response);
    } catch (error) {
      logger.error('Update insurance error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update insurance information',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public deleteInsurance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, insuranceId } = req.params;
      
      await this.patientService.deleteInsurance(id, insuranceId);

      const response: ApiResponse = {
        success: true,
        message: 'Insurance information deleted successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Delete insurance error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete insurance information',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getEmergencyContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const emergencyContacts = await this.patientService.getEmergencyContacts(id);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency contacts retrieved successfully',
        data: { emergencyContacts }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get emergency contacts error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve emergency contacts',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public addEmergencyContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const contactData = req.body;
      
      const emergencyContact = await this.patientService.addEmergencyContact(id, contactData);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency contact added successfully',
        data: { emergencyContact }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Add emergency contact error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to add emergency contact',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public updateEmergencyContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, contactId } = req.params;
      const contactData = req.body;
      
      const emergencyContact = await this.patientService.updateEmergencyContact(id, contactId, contactData);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency contact updated successfully',
        data: { emergencyContact }
      };

      res.json(response);
    } catch (error) {
      logger.error('Update emergency contact error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update emergency contact',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public deleteEmergencyContact = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, contactId } = req.params;
      
      await this.patientService.deleteEmergencyContact(id, contactId);

      const response: ApiResponse = {
        success: true,
        message: 'Emergency contact deleted successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Delete emergency contact error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete emergency contact',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const documents = await this.patientService.getDocuments(id);

      const response: ApiResponse = {
        success: true,
        message: 'Documents retrieved successfully',
        data: { documents }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get documents error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public uploadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const documentData = req.body;
      
      const document = await this.patientService.uploadDocument(id, documentData);

      const response: ApiResponse = {
        success: true,
        message: 'Document uploaded successfully',
        data: { document }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Upload document error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, documentId } = req.params;
      
      await this.patientService.deleteDocument(id, documentId);

      const response: ApiResponse = {
        success: true,
        message: 'Document deleted successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Delete document error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public getPatientStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const statistics = await this.patientService.getPatientStatistics(id);

      const response: ApiResponse = {
        success: true,
        message: 'Patient statistics retrieved successfully',
        data: { statistics }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get patient statistics error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve patient statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public exportPatient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.query;
      
      const exportData = await this.patientService.exportPatient(id, format as string);

      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="patient-${id}.${format}"`);
      res.send(exportData);
    } catch (error) {
      logger.error('Export patient error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to export patient data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };
}

