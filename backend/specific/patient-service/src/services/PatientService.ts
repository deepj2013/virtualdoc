import { PatientRepository } from '../repositories/PatientRepository';
import { MedicalHistoryRepository } from '../repositories/MedicalHistoryRepository';
import { InsuranceRepository } from '../repositories/InsuranceRepository';
import { EmergencyContactRepository } from '../repositories/EmergencyContactRepository';
import { DocumentRepository } from '../repositories/DocumentRepository';
import { logger } from '../utils/logger';
import { Patient, CreatePatientData, UpdatePatientData, SearchCriteria, PaginationResult } from '../types/Patient';
import { MedicalRecord, CreateMedicalRecordData } from '../types/MedicalRecord';
import { Insurance, CreateInsuranceData, UpdateInsuranceData } from '../types/Insurance';
import { EmergencyContact, CreateEmergencyContactData, UpdateEmergencyContactData } from '../types/EmergencyContact';
import { Document, CreateDocumentData } from '../types/Document';

export class PatientService {
  private patientRepository: PatientRepository;
  private medicalHistoryRepository: MedicalHistoryRepository;
  private insuranceRepository: InsuranceRepository;
  private emergencyContactRepository: EmergencyContactRepository;
  private documentRepository: DocumentRepository;

  constructor() {
    this.patientRepository = new PatientRepository();
    this.medicalHistoryRepository = new MedicalHistoryRepository();
    this.insuranceRepository = new InsuranceRepository();
    this.emergencyContactRepository = new EmergencyContactRepository();
    this.documentRepository = new DocumentRepository();
  }

  public async getPatients(criteria: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ patients: Patient[]; pagination: PaginationResult }> {
    try {
      const { patients, total } = await this.patientRepository.findMany(criteria);
      
      const pagination: PaginationResult = {
        page: criteria.page,
        limit: criteria.limit,
        total,
        totalPages: Math.ceil(total / criteria.limit)
      };

      return { patients, pagination };
    } catch (error) {
      logger.error('Failed to get patients:', error);
      throw new Error('Failed to retrieve patients');
    }
  }

  public async getPatientById(id: string): Promise<Patient> {
    try {
      const patient = await this.patientRepository.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    } catch (error) {
      logger.error('Failed to get patient by ID:', error);
      throw error;
    }
  }

  public async createPatient(data: CreatePatientData): Promise<Patient> {
    try {
      // Validate required fields
      if (!data.firstName || !data.lastName || !data.dateOfBirth) {
        throw new Error('First name, last name, and date of birth are required');
      }

      // Check if patient already exists with same email
      if (data.email) {
        const existingPatient = await this.patientRepository.findByEmail(data.email);
        if (existingPatient) {
          throw new Error('Patient with this email already exists');
        }
      }

      const patient = await this.patientRepository.create(data);
      logger.info(`Patient created: ${patient.id}`);
      return patient;
    } catch (error) {
      logger.error('Failed to create patient:', error);
      throw error;
    }
  }

  public async updatePatient(id: string, data: UpdatePatientData): Promise<Patient> {
    try {
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingPatient.email) {
        const emailExists = await this.patientRepository.findByEmail(data.email);
        if (emailExists) {
          throw new Error('Patient with this email already exists');
        }
      }

      const patient = await this.patientRepository.update(id, data);
      logger.info(`Patient updated: ${id}`);
      return patient;
    } catch (error) {
      logger.error('Failed to update patient:', error);
      throw error;
    }
  }

  public async deletePatient(id: string): Promise<void> {
    try {
      const patient = await this.patientRepository.findById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Soft delete - mark as inactive
      await this.patientRepository.update(id, { isActive: false });
      logger.info(`Patient deleted (soft): ${id}`);
    } catch (error) {
      logger.error('Failed to delete patient:', error);
      throw error;
    }
  }

  public async searchPatients(criteria: { query: string; filters: Record<string, any> }): Promise<Patient[]> {
    try {
      return await this.patientRepository.search(criteria.query, criteria.filters);
    } catch (error) {
      logger.error('Failed to search patients:', error);
      throw new Error('Failed to search patients');
    }
  }

  public async advancedSearch(criteria: SearchCriteria): Promise<{ patients: Patient[]; total: number }> {
    try {
      return await this.patientRepository.advancedSearch(criteria);
    } catch (error) {
      logger.error('Failed to perform advanced search:', error);
      throw new Error('Failed to perform advanced search');
    }
  }

  // Medical History Methods
  public async getMedicalHistory(patientId: string): Promise<MedicalRecord[]> {
    try {
      return await this.medicalHistoryRepository.findByPatientId(patientId);
    } catch (error) {
      logger.error('Failed to get medical history:', error);
      throw new Error('Failed to retrieve medical history');
    }
  }

  public async addMedicalHistory(patientId: string, data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const medicalRecord = await this.medicalHistoryRepository.create({
        ...data,
        patientId
      });
      logger.info(`Medical record added for patient: ${patientId}`);
      return medicalRecord;
    } catch (error) {
      logger.error('Failed to add medical history:', error);
      throw error;
    }
  }

  // Demographics Methods
  public async getDemographics(patientId: string): Promise<Partial<Patient>> {
    try {
      const patient = await this.patientRepository.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Return only demographic information
      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        address: patient.address,
        emergencyContact: patient.emergencyContact
      };
    } catch (error) {
      logger.error('Failed to get demographics:', error);
      throw error;
    }
  }

  public async updateDemographics(patientId: string, data: Partial<Patient>): Promise<Patient> {
    try {
      return await this.updatePatient(patientId, data);
    } catch (error) {
      logger.error('Failed to update demographics:', error);
      throw error;
    }
  }

  // Insurance Methods
  public async getInsurance(patientId: string): Promise<Insurance[]> {
    try {
      return await this.insuranceRepository.findByPatientId(patientId);
    } catch (error) {
      logger.error('Failed to get insurance:', error);
      throw new Error('Failed to retrieve insurance information');
    }
  }

  public async addInsurance(patientId: string, data: CreateInsuranceData): Promise<Insurance> {
    try {
      const insurance = await this.insuranceRepository.create({
        ...data,
        patientId
      });
      logger.info(`Insurance added for patient: ${patientId}`);
      return insurance;
    } catch (error) {
      logger.error('Failed to add insurance:', error);
      throw error;
    }
  }

  public async updateInsurance(patientId: string, insuranceId: string, data: UpdateInsuranceData): Promise<Insurance> {
    try {
      const insurance = await this.insuranceRepository.update(insuranceId, data);
      logger.info(`Insurance updated for patient: ${patientId}`);
      return insurance;
    } catch (error) {
      logger.error('Failed to update insurance:', error);
      throw error;
    }
  }

  public async deleteInsurance(patientId: string, insuranceId: string): Promise<void> {
    try {
      await this.insuranceRepository.delete(insuranceId);
      logger.info(`Insurance deleted for patient: ${patientId}`);
    } catch (error) {
      logger.error('Failed to delete insurance:', error);
      throw error;
    }
  }

  // Emergency Contact Methods
  public async getEmergencyContacts(patientId: string): Promise<EmergencyContact[]> {
    try {
      return await this.emergencyContactRepository.findByPatientId(patientId);
    } catch (error) {
      logger.error('Failed to get emergency contacts:', error);
      throw new Error('Failed to retrieve emergency contacts');
    }
  }

  public async addEmergencyContact(patientId: string, data: CreateEmergencyContactData): Promise<EmergencyContact> {
    try {
      const emergencyContact = await this.emergencyContactRepository.create({
        ...data,
        patientId
      });
      logger.info(`Emergency contact added for patient: ${patientId}`);
      return emergencyContact;
    } catch (error) {
      logger.error('Failed to add emergency contact:', error);
      throw error;
    }
  }

  public async updateEmergencyContact(patientId: string, contactId: string, data: UpdateEmergencyContactData): Promise<EmergencyContact> {
    try {
      const emergencyContact = await this.emergencyContactRepository.update(contactId, data);
      logger.info(`Emergency contact updated for patient: ${patientId}`);
      return emergencyContact;
    } catch (error) {
      logger.error('Failed to update emergency contact:', error);
      throw error;
    }
  }

  public async deleteEmergencyContact(patientId: string, contactId: string): Promise<void> {
    try {
      await this.emergencyContactRepository.delete(contactId);
      logger.info(`Emergency contact deleted for patient: ${patientId}`);
    } catch (error) {
      logger.error('Failed to delete emergency contact:', error);
      throw error;
    }
  }

  // Document Methods
  public async getDocuments(patientId: string): Promise<Document[]> {
    try {
      return await this.documentRepository.findByPatientId(patientId);
    } catch (error) {
      logger.error('Failed to get documents:', error);
      throw new Error('Failed to retrieve documents');
    }
  }

  public async uploadDocument(patientId: string, data: CreateDocumentData): Promise<Document> {
    try {
      const document = await this.documentRepository.create({
        ...data,
        patientId
      });
      logger.info(`Document uploaded for patient: ${patientId}`);
      return document;
    } catch (error) {
      logger.error('Failed to upload document:', error);
      throw error;
    }
  }

  public async deleteDocument(patientId: string, documentId: string): Promise<void> {
    try {
      await this.documentRepository.delete(documentId);
      logger.info(`Document deleted for patient: ${patientId}`);
    } catch (error) {
      logger.error('Failed to delete document:', error);
      throw error;
    }
  }

  // Statistics Methods
  public async getPatientStatistics(patientId: string): Promise<Record<string, any>> {
    try {
      const patient = await this.patientRepository.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const medicalHistory = await this.medicalHistoryRepository.findByPatientId(patientId);
      const insurance = await this.insuranceRepository.findByPatientId(patientId);
      const emergencyContacts = await this.emergencyContactRepository.findByPatientId(patientId);
      const documents = await this.documentRepository.findByPatientId(patientId);

      return {
        totalMedicalRecords: medicalHistory.length,
        totalInsurancePolicies: insurance.length,
        totalEmergencyContacts: emergencyContacts.length,
        totalDocuments: documents.length,
        lastMedicalRecord: medicalHistory.length > 0 ? medicalHistory[0].createdAt : null,
        patientAge: this.calculateAge(patient.dateOfBirth),
        isActive: patient.isActive
      };
    } catch (error) {
      logger.error('Failed to get patient statistics:', error);
      throw error;
    }
  }

  public async exportPatient(patientId: string, format: string): Promise<Buffer | string> {
    try {
      const patient = await this.patientRepository.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }

      const medicalHistory = await this.medicalHistoryRepository.findByPatientId(patientId);
      const insurance = await this.insuranceRepository.findByPatientId(patientId);
      const emergencyContacts = await this.emergencyContactRepository.findByPatientId(patientId);
      const documents = await this.documentRepository.findByPatientId(patientId);

      const exportData = {
        patient,
        medicalHistory,
        insurance,
        emergencyContacts,
        documents,
        exportedAt: new Date().toISOString()
      };

      if (format === 'pdf') {
        // TODO: Implement PDF generation
        return Buffer.from(JSON.stringify(exportData, null, 2));
      } else {
        return JSON.stringify(exportData, null, 2);
      }
    } catch (error) {
      logger.error('Failed to export patient:', error);
      throw error;
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

