import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { MedicalRecord, CreateMedicalRecordData } from '../types/MedicalRecord';
import { logger } from '../utils/logger';

export class MedicalHistoryRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'virtualdoc',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  public async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
      const query = `
        SELECT * FROM medical_records 
        WHERE patient_id = $1 AND is_active = true
        ORDER BY date_of_visit DESC
      `;
      const result = await this.pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding medical records by patient ID:', error);
      throw error;
    }
  }

  public async create(data: CreateMedicalRecordData & { patientId: string }): Promise<MedicalRecord> {
    try {
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO medical_records (
          id, patient_id, record_type, title, description, diagnosis, treatment,
          medications, vital_signs, lab_results, imaging_results, notes,
          doctor_id, doctor_name, date_of_visit, follow_up_date, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *
      `;

      const values = [
        id,
        data.patientId,
        data.recordType,
        data.title,
        data.description,
        data.diagnosis || null,
        data.treatment || null,
        data.medications ? JSON.stringify(data.medications) : null,
        data.vitalSigns ? JSON.stringify(data.vitalSigns) : null,
        data.labResults ? JSON.stringify(data.labResults) : null,
        data.imagingResults ? JSON.stringify(data.imagingResults) : null,
        data.notes || null,
        data.doctorId,
        data.doctorName,
        data.dateOfVisit,
        data.followUpDate || null,
        true,
        now,
        now
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating medical record:', error);
      throw error;
    }
  }
}

