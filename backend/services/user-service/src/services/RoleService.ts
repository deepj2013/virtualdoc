import { query, transaction } from '../config/database';
import { UserRole, CreateUserRoleRequest } from '../types/user.types';
import logger from '../utils/logger';

export class RoleService {
  /**
   * Create user role
   */
  async createUserRole(data: CreateUserRoleRequest): Promise<UserRole> {
    const result = await query(
      `INSERT INTO user_roles (
        user_id, role, tenant_id, department_id, assigned_by, assigned_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, true)
      ON CONFLICT (user_id, tenant_id, role, department_id) 
      DO UPDATE SET is_active = true, assigned_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        data.userId,
        data.role,
        data.tenantId,
        data.departmentId || null,
        data.assignedBy,
      ]
    );

    return this.formatUserRole(result.rows[0]);
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string, tenantId?: string | null): Promise<UserRole[]> {
    let result;
    if (tenantId !== undefined) {
      result = await query(
        `SELECT 
          id, user_id as "userId", role, tenant_id as "tenantId",
          department_id as "departmentId", assigned_by as "assignedBy",
          assigned_at as "assignedAt", is_active as "isActive"
        FROM user_roles 
        WHERE user_id = $1 AND (tenant_id = $2 OR $2 IS NULL)`,
        [userId, tenantId]
      );
    } else {
      result = await query(
        `SELECT 
          id, user_id as "userId", role, tenant_id as "tenantId",
          department_id as "departmentId", assigned_by as "assignedBy",
          assigned_at as "assignedAt", is_active as "isActive"
        FROM user_roles 
        WHERE user_id = $1`,
        [userId]
      );
    }
    return result.rows.map(row => this.formatUserRole(row));
  }

  /**
   * Remove user role
   */
  async removeUserRole(
    userId: string,
    role: string,
    tenantId: string,
    departmentId?: string | null
  ): Promise<void> {
    const result = await query(
      `UPDATE user_roles 
       SET is_active = false 
       WHERE user_id = $1 AND role = $2 AND tenant_id = $3 
       AND (department_id = $4 OR ($4 IS NULL AND department_id IS NULL))`,
      [userId, role, tenantId, departmentId || null]
    );

    if (result.rowCount === 0) {
      throw new Error('User role not found');
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(
    roleId: string,
    isActive: boolean
  ): Promise<UserRole> {
    const result = await query(
      `UPDATE user_roles 
       SET is_active = $1 
       WHERE id = $2
       RETURNING *`,
      [isActive, roleId]
    );

    if (!result.rows[0]) {
      throw new Error('User role not found');
    }

    return this.formatUserRole(result.rows[0]);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: string,
    tenantId: string,
    departmentId?: string | null
  ): Promise<any[]> {
    const result = await query(
      `SELECT 
        u.id, u.tenant_id as "tenantId", u.email, u.phone,
        u.first_name as "firstName", u.last_name as "lastName",
        u.role, u.is_active as "isActive", u.created_at as "createdAt"
      FROM users u
      INNER JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role = $1 AND ur.tenant_id = $2 
      AND ur.is_active = true AND u.is_active = true
      AND (ur.department_id = $3 OR ($3 IS NULL AND ur.department_id IS NULL))`,
      [role, tenantId, departmentId || null]
    );
    return result.rows;
  }

  /**
   * Format user role response
   */
  private formatUserRole(row: any): UserRole {
    return {
      id: row.id,
      userId: row.userId || row.user_id,
      role: row.role,
      tenantId: row.tenantId || row.tenant_id,
      departmentId: row.departmentId || row.department_id,
      assignedBy: row.assignedBy || row.assigned_by,
      assignedAt: row.assignedAt || row.assigned_at,
      isActive: row.isActive !== undefined ? row.isActive : row.is_active,
    };
  }
}

export default new RoleService();

