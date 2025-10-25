import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { EmergencyContact, CreateEmergencyContactData, UpdateEmergencyContactData } from '../types/EmergencyContact';
import { logger } from '../utils/logger';

export class EmergencyContactRepository {
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

  public async findByPatientId(patientId: string): Promise<EmergencyContact[]> {
    try {
      const query = `
        SELECT * FROM emergency_contacts 
        WHERE patient_id = $1 AND is_active = true
        ORDER BY is_primary DESC, created_at ASC
      `;
      const result = await this.pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding emergency contacts by patient ID:', error);
      throw error;
    }
  }

  public async create(data: CreateEmergencyContactData & { patientId: string }): Promise<EmergencyContact> {
    try {
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO emergency_contacts (
          id, patient_id, name, relationship, phone_number, email,
          address, is_primary, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *
      `;

      const values = [
        id,
        data.patientId,
        data.name,
        data.relationship,
        data.phoneNumber,
        data.email || null,
        data.address ? JSON.stringify(data.address) : null,
        data.isPrimary,
        true,
        now,
        now
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating emergency contact:', error);
      throw error;
    }
  }

  public async update(id: string, data: UpdateEmergencyContactData): Promise<EmergencyContact> {
    try {
      const now = new Date();
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          
          if (key === 'address') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      paramCount++;
      updateFields.push(`updated_at = $${paramCount}`);
      values.push(now);

      paramCount++;
      values.push(id);

      const query = `
        UPDATE emergency_contacts 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Emergency contact not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating emergency contact:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const query = `
        UPDATE emergency_contacts 
        SET is_active = false, updated_at = $1
        WHERE id = $2
      `;
      await this.pool.query(query, [new Date(), id]);
    } catch (error) {
      logger.error('Error deleting emergency contact:', error);
      throw error;
    }
  }
}

