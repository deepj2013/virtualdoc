import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Patient, CreatePatientData, UpdatePatientData, SearchCriteria } from '../types/Patient';
import { logger } from '../utils/logger';

export class PatientRepository {
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

  public async findById(id: string): Promise<Patient | null> {
    try {
      const query = `
        SELECT * FROM patients 
        WHERE id = $1 AND is_active = true
      `;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding patient by ID:', error);
      throw error;
    }
  }

  public async findByEmail(email: string): Promise<Patient | null> {
    try {
      const query = `
        SELECT * FROM patients 
        WHERE email = $1 AND is_active = true
      `;
      const result = await this.pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding patient by email:', error);
      throw error;
    }
  }

  public async findMany(criteria: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ patients: Patient[]; total: number }> {
    try {
      const offset = (criteria.page - 1) * criteria.limit;
      let whereClause = 'WHERE is_active = true';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (criteria.search) {
        paramCount++;
        whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        queryParams.push(`%${criteria.search}%`);
      }

      if (criteria.status) {
        paramCount++;
        whereClause += ` AND status = $${paramCount}`;
        queryParams.push(criteria.status);
      }

      // Count query
      const countQuery = `SELECT COUNT(*) FROM patients ${whereClause}`;
      const countResult = await this.pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Data query
      paramCount++;
      const orderBy = `ORDER BY ${criteria.sortBy} ${criteria.sortOrder.toUpperCase()}`;
      const limitClause = `LIMIT $${paramCount}`;
      paramCount++;
      const offsetClause = `OFFSET $${paramCount}`;
      
      queryParams.push(criteria.limit, offset);

      const query = `
        SELECT * FROM patients 
        ${whereClause}
        ${orderBy}
        ${limitClause}
        ${offsetClause}
      `;

      const result = await this.pool.query(query, queryParams);
      return { patients: result.rows, total };
    } catch (error) {
      logger.error('Error finding patients:', error);
      throw error;
    }
  }

  public async create(data: CreatePatientData): Promise<Patient> {
    try {
      const id = uuidv4();
      const now = new Date();

      const query = `
        INSERT INTO patients (
          id, first_name, last_name, date_of_birth, gender, phone_number, 
          email, address, emergency_contact, medical_record_number, 
          blood_type, allergies, medications, is_active, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `;

      const values = [
        id,
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        data.gender,
        data.phoneNumber || null,
        data.email || null,
        data.address ? JSON.stringify(data.address) : null,
        data.emergencyContact ? JSON.stringify(data.emergencyContact) : null,
        data.medicalRecordNumber || null,
        data.bloodType || null,
        data.allergies ? JSON.stringify(data.allergies) : null,
        data.medications ? JSON.stringify(data.medications) : null,
        true,
        now,
        now
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating patient:', error);
      throw error;
    }
  }

  public async update(id: string, data: UpdatePatientData): Promise<Patient> {
    try {
      const now = new Date();
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCount = 0;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          updateFields.push(`${key} = $${paramCount}`);
          
          if (key === 'address' || key === 'emergencyContact' || key === 'allergies' || key === 'medications') {
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
        UPDATE patients 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount} AND is_active = true
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Patient not found');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error updating patient:', error);
      throw error;
    }
  }

  public async search(query: string, filters: Record<string, any>): Promise<Patient[]> {
    try {
      let whereClause = 'WHERE is_active = true';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (query) {
        paramCount++;
        whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        queryParams.push(`%${query}%`);
      }

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          paramCount++;
          whereClause += ` AND ${key} = $${paramCount}`;
          queryParams.push(value);
        }
      });

      const sql = `SELECT * FROM patients ${whereClause} ORDER BY created_at DESC LIMIT 50`;
      const result = await this.pool.query(sql, queryParams);
      return result.rows;
    } catch (error) {
      logger.error('Error searching patients:', error);
      throw error;
    }
  }

  public async advancedSearch(criteria: SearchCriteria): Promise<{ patients: Patient[]; total: number }> {
    try {
      let whereClause = 'WHERE is_active = true';
      const queryParams: any[] = [];
      let paramCount = 0;

      if (criteria.query) {
        paramCount++;
        whereClause += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        queryParams.push(`%${criteria.query}%`);
      }

      if (criteria.filters) {
        if (criteria.filters.gender) {
          paramCount++;
          whereClause += ` AND gender = $${paramCount}`;
          queryParams.push(criteria.filters.gender);
        }

        if (criteria.filters.bloodType) {
          paramCount++;
          whereClause += ` AND blood_type = $${paramCount}`;
          queryParams.push(criteria.filters.bloodType);
        }

        if (criteria.filters.ageRange) {
          const currentDate = new Date();
          const minBirthDate = new Date(currentDate.getFullYear() - criteria.filters.ageRange.max, currentDate.getMonth(), currentDate.getDate());
          const maxBirthDate = new Date(currentDate.getFullYear() - criteria.filters.ageRange.min, currentDate.getMonth(), currentDate.getDate());
          
          paramCount++;
          whereClause += ` AND date_of_birth >= $${paramCount}`;
          queryParams.push(minBirthDate);
          
          paramCount++;
          whereClause += ` AND date_of_birth <= $${paramCount}`;
          queryParams.push(maxBirthDate);
        }

        if (criteria.filters.hasAllergies !== undefined) {
          if (criteria.filters.hasAllergies) {
            whereClause += ` AND allergies IS NOT NULL AND jsonb_array_length(allergies) > 0`;
          } else {
            whereClause += ` AND (allergies IS NULL OR jsonb_array_length(allergies) = 0)`;
          }
        }

        if (criteria.filters.isActive !== undefined) {
          paramCount++;
          whereClause += ` AND is_active = $${paramCount}`;
          queryParams.push(criteria.filters.isActive);
        }
      }

      // Count query
      const countQuery = `SELECT COUNT(*) FROM patients ${whereClause}`;
      const countResult = await this.pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].count);

      // Data query
      const sortBy = criteria.sortBy || 'created_at';
      const sortOrder = criteria.sortOrder || 'desc';
      const limit = criteria.limit || 10;
      const page = criteria.page || 1;
      const offset = (page - 1) * limit;

      paramCount++;
      const orderBy = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      const limitClause = `LIMIT $${paramCount}`;
      paramCount++;
      const offsetClause = `OFFSET $${paramCount}`;
      
      queryParams.push(limit, offset);

      const query = `
        SELECT * FROM patients 
        ${whereClause}
        ${orderBy}
        ${limitClause}
        ${offsetClause}
      `;

      const result = await this.pool.query(query, queryParams);
      return { patients: result.rows, total };
    } catch (error) {
      logger.error('Error performing advanced search:', error);
      throw error;
    }
  }
}

