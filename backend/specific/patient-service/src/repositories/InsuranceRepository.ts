import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Insurance, CreateInsuranceData, UpdateInsuranceData } from '../types/Insurance';
import { logger } from '../utils/logger';

export class InsuranceRepository {
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

  public async findByPatientId(patientId: string): Promise<Insurance[]> {
    try {
      const query = `
        SELECT * FROM insurance 
        WHERE patient_id = $1 AND is_active = true
        ORDER BY is_primary DESC, effective_date DESC
      `;
      const result = await this.pool.query(query, [patientId]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding insurance by patient ID:', error);
      throw error;
    }
  }

  public async create(data: CreateInsuranceData & { patientId: string }): Promise<Insurance> {
    try {
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO insurance (
          id, patient_id, provider_name, policy_number, group_number,
          policy_holder_name, relationship_to_patient, effective_date,
          expiration_date, copay_amount, deductible_amount, out_of_pocket_maximum,
          coverage_percentage, is_primary, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `;

      const values = [
        id,
        data.patientId,
        data.providerName,
        data.policyNumber,
        data.groupNumber || null,
        data.policyHolderName,
        data.relationshipToPatient,
        data.effectiveDate,
        data.expirationDate || null,
        data.copayAmount || null,
        data.deductibleAmount || null,
        data.outOfPocketMaximum || null,
        data.coveragePercentage || null,
        data.isPrimary,
        true,
        now,
        now
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating insurance:', error);
      throw error;
    }
  }

  public async update(id: string, data: UpdateInsuranceData): Promise<Insurance> {
    try {
      const now = new Date();
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
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
        UPDATE insurance 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Insurance not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating insurance:', error);
      throw error;
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      const query = `
        UPDATE insurance 
        SET is_active = false, updated_at = $1
        WHERE id = $2
      `;
      await this.pool.query(query, [new Date(), id]);
    } catch (error) {
      logger.error('Error deleting insurance:', error);
      throw error;
    }
  }
}

