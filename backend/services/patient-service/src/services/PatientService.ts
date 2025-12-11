import { query, transaction } from '../config/database';
import { Patient, CreatePatientDto, UpdatePatientDto, PatientSearchParams } from '../types/patient.types';

class PatientService {
  /**
   * Generate unique patient number
   */
  private async generatePatientNumber(tenantId: string, client?: any): Promise<string> {
    const prefix = tenantId ? tenantId.substring(0, 8).toUpperCase() : 'PAT';
    const year = new Date().getFullYear();
    
    // Get count of patients for this tenant this year
    const queryFn = client || query;
    const countResult = await queryFn(
      `SELECT COUNT(*) as count 
      FROM patients 
      WHERE tenant_id = $1 
        AND patient_number LIKE $2`,
      [tenantId, `${prefix}-${year}-%`]
    );

    const count = parseInt(countResult.rows[0].count, 10) + 1;
    return `${prefix}-${year}-${String(count).padStart(6, '0')}`;
  }

  /**
   * Create new patient
   */
  async createPatient(
    data: CreatePatientDto,
    tenantId: string,
    createdBy: string
  ): Promise<Patient> {
    return await transaction(async (client) => {
      // Generate patient number
      const patientNumber = await this.generatePatientNumber(tenantId, client);

      const result = await client.query(
        `INSERT INTO patients (
          tenant_id, patient_number, first_name, last_name, middle_name,
          date_of_birth, gender, blood_group, height_cm, weight_kg,
          phone, email, address_line1, address_line2, city, state,
          postal_code, country, emergency_contact_name, emergency_contact_phone,
          emergency_contact_relation, insurance_provider, insurance_number,
          abha_id, aadhar_number, pan_number, is_active, created_by,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, true,
          $28, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING *`,
        [
          tenantId,
          patientNumber,
          data.firstName,
          data.lastName,
          data.middleName || null,
          data.dateOfBirth,
          data.gender,
          data.bloodGroup || null,
          data.heightCm || null,
          data.weightKg || null,
          data.phone || null,
          data.email ? data.email.toLowerCase() : null,
          data.addressLine1 || null,
          data.addressLine2 || null,
          data.city || null,
          data.state || null,
          data.postalCode || null,
          data.country || 'India',
          data.emergencyContactName || null,
          data.emergencyContactPhone || null,
          data.emergencyContactRelation || null,
          data.insuranceProvider || null,
          data.insuranceNumber || null,
          data.abhaId || null,
          data.aadharNumber || null,
          data.panNumber || null,
          createdBy,
        ]
      );

      return this.mapRowToPatient(result.rows[0]);
    });
  }

  /**
   * Get patient by ID
   */
  async getPatientById(patientId: string, tenantId: string | null = null): Promise<Patient | null> {
    const result = await query(
      `SELECT * FROM patients 
      WHERE id = $1 
        AND (tenant_id = $2 OR $2 IS NULL OR tenant_id IS NULL)`,
      [patientId, tenantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPatient(result.rows[0]);
  }

  /**
   * Get patient by patient number
   */
  async getPatientByNumber(patientNumber: string, tenantId: string | null = null): Promise<Patient | null> {
    const result = await query(
      `SELECT * FROM patients 
      WHERE patient_number = $1 
        AND (tenant_id = $2 OR $2 IS NULL OR tenant_id IS NULL)`,
      [patientNumber, tenantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPatient(result.rows[0]);
  }

  /**
   * Update patient
   */
  async updatePatient(
    patientId: string,
    data: UpdatePatientDto,
    tenantId: string | null = null
  ): Promise<Patient> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(data.lastName);
    }
    if (data.middleName !== undefined) {
      updates.push(`middle_name = $${paramCount++}`);
      values.push(data.middleName);
    }
    if (data.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(data.dateOfBirth);
    }
    if (data.gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(data.gender);
    }
    if (data.bloodGroup !== undefined) {
      updates.push(`blood_group = $${paramCount++}`);
      values.push(data.bloodGroup);
    }
    if (data.heightCm !== undefined) {
      updates.push(`height_cm = $${paramCount++}`);
      values.push(data.heightCm);
    }
    if (data.weightKg !== undefined) {
      updates.push(`weight_kg = $${paramCount++}`);
      values.push(data.weightKg);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email ? data.email.toLowerCase() : null);
    }
    if (data.addressLine1 !== undefined) {
      updates.push(`address_line1 = $${paramCount++}`);
      values.push(data.addressLine1);
    }
    if (data.addressLine2 !== undefined) {
      updates.push(`address_line2 = $${paramCount++}`);
      values.push(data.addressLine2);
    }
    if (data.city !== undefined) {
      updates.push(`city = $${paramCount++}`);
      values.push(data.city);
    }
    if (data.state !== undefined) {
      updates.push(`state = $${paramCount++}`);
      values.push(data.state);
    }
    if (data.postalCode !== undefined) {
      updates.push(`postal_code = $${paramCount++}`);
      values.push(data.postalCode);
    }
    if (data.country !== undefined) {
      updates.push(`country = $${paramCount++}`);
      values.push(data.country);
    }
    if (data.emergencyContactName !== undefined) {
      updates.push(`emergency_contact_name = $${paramCount++}`);
      values.push(data.emergencyContactName);
    }
    if (data.emergencyContactPhone !== undefined) {
      updates.push(`emergency_contact_phone = $${paramCount++}`);
      values.push(data.emergencyContactPhone);
    }
    if (data.emergencyContactRelation !== undefined) {
      updates.push(`emergency_contact_relation = $${paramCount++}`);
      values.push(data.emergencyContactRelation);
    }
    if (data.insuranceProvider !== undefined) {
      updates.push(`insurance_provider = $${paramCount++}`);
      values.push(data.insuranceProvider);
    }
    if (data.insuranceNumber !== undefined) {
      updates.push(`insurance_number = $${paramCount++}`);
      values.push(data.insuranceNumber);
    }
    if (data.abhaId !== undefined) {
      updates.push(`abha_id = $${paramCount++}`);
      values.push(data.abhaId);
    }
    if (data.aadharNumber !== undefined) {
      updates.push(`aadhar_number = $${paramCount++}`);
      values.push(data.aadharNumber);
    }
    if (data.panNumber !== undefined) {
      updates.push(`pan_number = $${paramCount++}`);
      values.push(data.panNumber);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(data.isActive);
    }

    if (updates.length === 0) {
      const patient = await this.getPatientById(patientId, tenantId);
      if (!patient) {
        throw new Error('Patient not found');
      }
      return patient;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(patientId, tenantId);

    const result = await query(
      `UPDATE patients 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} 
        AND (tenant_id = $${paramCount++} OR $${paramCount - 1} IS NULL OR tenant_id IS NULL)
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Patient not found or access denied');
    }

    return this.mapRowToPatient(result.rows[0]);
  }

  /**
   * Delete patient (soft delete by setting is_active = false)
   */
  async deletePatient(patientId: string, tenantId: string | null = null): Promise<void> {
    const result = await query(
      `UPDATE patients 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
        AND (tenant_id = $2 OR $2 IS NULL OR tenant_id IS NULL)`,
      [patientId, tenantId]
    );

    if (result.rowCount === 0) {
      throw new Error('Patient not found or access denied');
    }
  }

  /**
   * Search patients
   */
  async searchPatients(
    params: PatientSearchParams,
    tenantId: string | null = null
  ): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Tenant filtering
    if (tenantId !== null) {
      conditions.push(`tenant_id = $${paramCount++}`);
      values.push(tenantId);
    }

    // Search term
    if (params.search) {
      conditions.push(
        `(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR patient_number ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      );
      values.push(`%${params.search}%`);
      paramCount++;
    }

    // Gender filter
    if (params.gender) {
      conditions.push(`gender = $${paramCount++}`);
      values.push(params.gender);
    }

    // Blood group filter
    if (params.bloodGroup) {
      conditions.push(`blood_group = $${paramCount++}`);
      values.push(params.bloodGroup);
    }

    // City filter
    if (params.city) {
      conditions.push(`city ILIKE $${paramCount++}`);
      values.push(`%${params.city}%`);
    }

    // State filter
    if (params.state) {
      conditions.push(`state ILIKE $${paramCount++}`);
      values.push(`%${params.state}%`);
    }

    // Active filter
    if (params.isActive !== undefined) {
      conditions.push(`is_active = $${paramCount++}`);
      values.push(params.isActive);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM patients ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get patients
    const patientsResult = await query(
      `SELECT * FROM patients 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      [...values, limit, offset]
    );

    return {
      patients: patientsResult.rows.map(row => this.mapRowToPatient(row)),
      total,
      page,
      limit,
    };
  }

  /**
   * Map database row to Patient object
   */
  private mapRowToPatient(row: any): Patient {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      userId: row.user_id,
      patientNumber: row.patient_number,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      bloodGroup: row.blood_group,
      heightCm: row.height_cm,
      weightKg: row.weight_kg,
      phone: row.phone,
      email: row.email,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      emergencyContactName: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      emergencyContactRelation: row.emergency_contact_relation,
      insuranceProvider: row.insurance_provider,
      insuranceNumber: row.insurance_number,
      abhaId: row.abha_id,
      aadharNumber: row.aadhar_number,
      panNumber: row.pan_number,
      isActive: row.is_active,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new PatientService();

