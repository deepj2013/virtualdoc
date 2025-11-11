import { query, transaction } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';
import { hashPassword } from '../helpers/password.helper';
import logger from '../utils/logger';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const passwordHash = data.password ? await hashPassword(data.password) : null;

    const result = await query(
      `INSERT INTO users (
        tenant_id, email, password_hash, phone, first_name, last_name, middle_name,
        date_of_birth, gender, role, email_verified, phone_verified, is_active,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        data.tenantId || null,
        data.email.toLowerCase(),
        passwordHash,
        data.phone || null,
        data.firstName,
        data.lastName,
        data.middleName || null,
        data.dateOfBirth || null,
        data.gender || null,
        data.role,
        false, // email_verified
        false, // phone_verified
        true, // is_active
      ]
    );

    const user = result.rows[0] as User;

    // If departmentId is provided, create user_role
    if (data.departmentId) {
      await query(
        `INSERT INTO user_roles (user_id, role, tenant_id, department_id, assigned_by, assigned_at, is_active)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, true)`,
        [user.id, data.role, data.tenantId || null, data.departmentId, null]
      );
    }

    return user;
  }

  /**
   * Find user by ID
   */
  async findById(userId: string, tenantId?: string | null): Promise<User | null> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        `SELECT 
          id, tenant_id as "tenantId", email, password_hash as "passwordHash",
          phone, phone_verified as "phoneVerified", email_verified as "emailVerified",
          first_name as "firstName", last_name as "lastName", middle_name as "middleName",
          date_of_birth as "dateOfBirth", gender, profile_picture_url as "profilePictureUrl",
          role, is_active as "isActive", last_login_at as "lastLoginAt",
          mfa_enabled as "mfaEnabled", mfa_secret as "mfaSecret",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE id = $1 AND (tenant_id = $2 OR $2 IS NULL)`,
        [userId, tenantId]
      );
    } else {
      result = await query(
        `SELECT 
          id, tenant_id as "tenantId", email, password_hash as "passwordHash",
          phone, phone_verified as "phoneVerified", email_verified as "emailVerified",
          first_name as "firstName", last_name as "lastName", middle_name as "middleName",
          date_of_birth as "dateOfBirth", gender, profile_picture_url as "profilePictureUrl",
          role, is_active as "isActive", last_login_at as "lastLoginAt",
          mfa_enabled as "mfaEnabled", mfa_secret as "mfaSecret",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE id = $1`,
        [userId]
      );
    }
    
    if (!result.rows[0]) {
      return null;
    }
    
    return result.rows[0] as User;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string, tenantId?: string | null): Promise<User | null> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        `SELECT 
          id, tenant_id as "tenantId", email, password_hash as "passwordHash",
          phone, phone_verified as "phoneVerified", email_verified as "emailVerified",
          first_name as "firstName", last_name as "lastName", middle_name as "middleName",
          date_of_birth as "dateOfBirth", gender, profile_picture_url as "profilePictureUrl",
          role, is_active as "isActive", last_login_at as "lastLoginAt",
          mfa_enabled as "mfaEnabled", mfa_secret as "mfaSecret",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE email = $1 AND (tenant_id = $2 OR $2 IS NULL)`,
        [email.toLowerCase(), tenantId]
      );
    } else {
      result = await query(
        `SELECT 
          id, tenant_id as "tenantId", email, password_hash as "passwordHash",
          phone, phone_verified as "phoneVerified", email_verified as "emailVerified",
          first_name as "firstName", last_name as "lastName", middle_name as "middleName",
          date_of_birth as "dateOfBirth", gender, profile_picture_url as "profilePictureUrl",
          role, is_active as "isActive", last_login_at as "lastLoginAt",
          mfa_enabled as "mfaEnabled", mfa_secret as "mfaSecret",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );
    }
    
    if (!result.rows[0]) {
      return null;
    }
    
    return result.rows[0] as User;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserRequest, tenantId?: string | null): Promise<User> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (data.firstName !== undefined) {
      updateFields.push(`first_name = $${paramIndex++}`);
      updateValues.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updateFields.push(`last_name = $${paramIndex++}`);
      updateValues.push(data.lastName);
    }
    if (data.middleName !== undefined) {
      updateFields.push(`middle_name = $${paramIndex++}`);
      updateValues.push(data.middleName);
    }
    if (data.phone !== undefined) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(data.phone);
    }
    if (data.dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramIndex++}`);
      updateValues.push(data.dateOfBirth);
    }
    if (data.gender !== undefined) {
      updateFields.push(`gender = $${paramIndex++}`);
      updateValues.push(data.gender);
    }
    if (data.profilePictureUrl !== undefined) {
      updateFields.push(`profile_picture_url = $${paramIndex++}`);
      updateValues.push(data.profilePictureUrl);
    }
    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${paramIndex++}`);
      updateValues.push(data.isActive);
    }

    if (updateFields.length === 0) {
      const user = await this.findById(userId, tenantId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);
    
    let queryText;
    if (tenantId !== undefined) {
      updateValues.push(tenantId);
      queryText = `UPDATE users SET ${updateFields.join(', ')} 
                   WHERE id = $${paramIndex} AND (tenant_id = $${paramIndex + 1} OR $${paramIndex + 1} IS NULL)
                   RETURNING *`;
    } else {
      queryText = `UPDATE users SET ${updateFields.join(', ')} 
                   WHERE id = $${paramIndex}
                   RETURNING *`;
    }

    const result = await query(
      queryText,
      updateValues
    );

    if (!result.rows[0]) {
      throw new Error('User not found');
    }

    return result.rows[0] as User;
  }

  /**
   * Delete user (soft delete by setting is_active = false)
   */
  async deleteUser(userId: string, tenantId?: string | null): Promise<void> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND (tenant_id = $2 OR $2 IS NULL)`,
        [userId, tenantId]
      );
    } else {
      result = await query(
        `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [userId]
      );
    }

    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  /**
   * List users with pagination
   */
  async listUsers(
    tenantId?: string | null,
    role?: string,
    departmentId?: string,
    isActive?: boolean,
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (tenantId !== undefined) {
      conditions.push(`(tenant_id = $${paramIndex} OR $${paramIndex} IS NULL)`);
      params.push(tenantId);
      paramIndex++;
    }

    if (role) {
      conditions.push(`role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    if (isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex}`);
      params.push(isActive);
      paramIndex++;
    }

    if (departmentId) {
      conditions.push(`id IN (
        SELECT user_id FROM user_roles 
        WHERE department_id = $${paramIndex} AND is_active = true
      )`);
      params.push(departmentId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get users
    params.push(limit, offset);
    const result = await query(
      `SELECT 
        id, tenant_id as "tenantId", email, password_hash as "passwordHash",
        phone, phone_verified as "phoneVerified", email_verified as "emailVerified",
        first_name as "firstName", last_name as "lastName", middle_name as "middleName",
        date_of_birth as "dateOfBirth", gender, profile_picture_url as "profilePictureUrl",
        role, is_active as "isActive", last_login_at as "lastLoginAt",
        mfa_enabled as "mfaEnabled", mfa_secret as "mfaSecret",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return {
      users: result.rows as User[],
      total,
    };
  }

  /**
   * Check if email already exists
   */
  async emailExists(email: string, tenantId?: string | null): Promise<boolean> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1 AND (tenant_id = $2 OR $2 IS NULL)',
        [email.toLowerCase(), tenantId]
      );
    } else {
      result = await query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1',
        [email.toLowerCase()]
      );
    }
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string, tenantId?: string | null): Promise<any[]> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        `SELECT 
          id, user_id as "userId", role, tenant_id as "tenantId",
          department_id as "departmentId", assigned_by as "assignedBy",
          assigned_at as "assignedAt", is_active as "isActive"
        FROM user_roles 
        WHERE user_id = $1 AND (tenant_id = $2 OR $2 IS NULL) AND is_active = true`,
        [userId, tenantId]
      );
    } else {
      result = await query(
        `SELECT 
          id, user_id as "userId", role, tenant_id as "tenantId",
          department_id as "departmentId", assigned_by as "assignedBy",
          assigned_at as "assignedAt", is_active as "isActive"
        FROM user_roles 
        WHERE user_id = $1 AND is_active = true`,
        [userId]
      );
    }
    return result.rows;
  }

  /**
   * Format user response (remove sensitive data)
   */
  formatUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      profilePictureUrl: user.profilePictureUrl,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new UserService();

