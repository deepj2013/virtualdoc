import { query } from '../config/database';
import { Permission, CreatePermissionRequest, RolePermission, AssignRolePermissionRequest } from '../types/user.types';
import logger from '../utils/logger';

export class PermissionService {
  /**
   * Create permission
   */
  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    const result = await query(
      `INSERT INTO permissions (name, code, module, description, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (code) DO UPDATE 
       SET name = EXCLUDED.name, module = EXCLUDED.module, description = EXCLUDED.description
       RETURNING *`,
      [data.name, data.code, data.module, data.description || null]
    );

    return this.formatPermission(result.rows[0]);
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const result = await query(
      `SELECT id, name, code, module, description, created_at as "createdAt"
       FROM permissions
       ORDER BY module, name`
    );
    return result.rows.map(row => this.formatPermission(row));
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(permissionId: string): Promise<Permission | null> {
    const result = await query(
      `SELECT id, name, code, module, description, created_at as "createdAt"
       FROM permissions
       WHERE id = $1`,
      [permissionId]
    );

    if (!result.rows[0]) {
      return null;
    }

    return this.formatPermission(result.rows[0]);
  }

  /**
   * Get permissions by module
   */
  async getPermissionsByModule(module: string): Promise<Permission[]> {
    const result = await query(
      `SELECT id, name, code, module, description, created_at as "createdAt"
       FROM permissions
       WHERE module = $1
       ORDER BY name`,
      [module]
    );
    return result.rows.map(row => this.formatPermission(row));
  }

  /**
   * Assign permission to role
   */
  async assignRolePermission(data: AssignRolePermissionRequest): Promise<RolePermission> {
    const result = await query(
      `INSERT INTO role_permissions (
        role, permission_id, can_read, can_write, can_delete, can_manage, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (role, permission_id) 
      DO UPDATE SET 
        can_read = EXCLUDED.can_read,
        can_write = EXCLUDED.can_write,
        can_delete = EXCLUDED.can_delete,
        can_manage = EXCLUDED.can_manage
      RETURNING *`,
      [
        data.role,
        data.permissionId,
        data.canRead !== undefined ? data.canRead : false,
        data.canWrite !== undefined ? data.canWrite : false,
        data.canDelete !== undefined ? data.canDelete : false,
        data.canManage !== undefined ? data.canManage : false,
      ]
    );

    return this.formatRolePermission(result.rows[0]);
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(role: string): Promise<RolePermission[]> {
    const result = await query(
      `SELECT 
        rp.id, rp.role, rp.permission_id as "permissionId",
        rp.can_read as "canRead", rp.can_write as "canWrite",
        rp.can_delete as "canDelete", rp.can_manage as "canManage",
        rp.created_at as "createdAt",
        p.name as "permissionName", p.code as "permissionCode", p.module as "permissionModule"
      FROM role_permissions rp
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role = $1
      ORDER BY p.module, p.name`,
      [role]
    );
    return result.rows.map(row => this.formatRolePermission(row));
  }

  /**
   * Remove role permission
   */
  async removeRolePermission(role: string, permissionId: string): Promise<void> {
    const result = await query(
      `DELETE FROM role_permissions 
       WHERE role = $1 AND permission_id = $2`,
      [role, permissionId]
    );

    if (result.rowCount === 0) {
      throw new Error('Role permission not found');
    }
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(
    userId: string,
    permissionCode: string,
    tenantId?: string | null
  ): Promise<boolean> {
    // Get user's role
    let userResult;
    if (tenantId !== undefined) {
      userResult = await query(
        `SELECT role FROM users WHERE id = $1 AND (tenant_id = $2 OR $2 IS NULL)`,
        [userId, tenantId]
      );
    } else {
      userResult = await query(
        `SELECT role FROM users WHERE id = $1`,
        [userId]
      );
    }

    if (!userResult.rows[0]) {
      return false;
    }

    const userRole = userResult.rows[0].role;

    // Check if permission exists and is assigned to role
    const permissionResult = await query(
      `SELECT COUNT(*) as count
       FROM role_permissions rp
       INNER JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role = $1 AND p.code = $2
       AND (rp.can_read = true OR rp.can_write = true OR rp.can_delete = true OR rp.can_manage = true)`,
      [userRole, permissionCode]
    );

    return parseInt(permissionResult.rows[0].count) > 0;
  }

  /**
   * Format permission response
   */
  private formatPermission(row: any): Permission {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      module: row.module,
      description: row.description,
      createdAt: row.createdAt || row.created_at,
    };
  }

  /**
   * Format role permission response
   */
  private formatRolePermission(row: any): RolePermission {
    return {
      id: row.id,
      role: row.role,
      permissionId: row.permissionId || row.permission_id,
      canRead: row.canRead !== undefined ? row.canRead : row.can_read,
      canWrite: row.canWrite !== undefined ? row.canWrite : row.can_write,
      canDelete: row.canDelete !== undefined ? row.canDelete : row.can_delete,
      canManage: row.canManage !== undefined ? row.canManage : row.can_manage,
      createdAt: row.createdAt || row.created_at,
    };
  }
}

export default new PermissionService();

