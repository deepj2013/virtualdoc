import { query, transaction } from '../config/database';
import { AdminUser } from '../types/admin.types';
import UserService from './UserService';

export class AdminService {
  /**
   * Get or create Universal Admin role
   */
  async getOrCreateUniversalAdminRole(): Promise<string> {
    let result = await query(
      "SELECT id FROM admin_roles WHERE role_code = 'universal_admin'"
    );

    if (result.rows.length === 0) {
      // Create Universal Admin role
      result = await query(
        `INSERT INTO admin_roles (
          role_code, role_name, role_description, hierarchy_level,
          permissions, can_manage_users, can_manage_tenants, can_manage_admins,
          can_access_analytics, can_manage_billing, can_configure_system,
          scope, is_active, created_at, updated_at
        ) VALUES (
          'universal_admin', 'Universal Admin', 'Full access to entire platform', 1,
          '["*"]'::jsonb, true, true, true, true, true, true,
          'global', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id`
      );
    }

    return result.rows[0].id;
  }

  /**
   * Create Universal Admin
   */
  async createUniversalAdmin(data: {
    userId: string;
  }): Promise<AdminUser> {
    const adminRoleId = await this.getOrCreateUniversalAdminRole();

    const result = await query(
      `INSERT INTO admin_users (
        user_id, tenant_id, admin_role_id, admin_role_code,
        assigned_tenant_id, assigned_departments, is_active,
        is_suspended, two_factor_enabled, assigned_at,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        data.userId,
        null, // tenant_id for universal admin
        adminRoleId,
        'universal_admin',
        null, // assigned_tenant_id
        null, // assigned_departments
        true, // is_active
        false, // is_suspended
        false, // two_factor_enabled
      ]
    );

    return result.rows[0] as AdminUser;
  }

  /**
   * Find admin by user ID
   */
  async findByUserId(userId: string): Promise<AdminUser | null> {
    const result = await query(
      'SELECT * FROM admin_users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] as AdminUser || null;
  }

  /**
   * Find admin with user details
   */
  async findAdminWithUser(userId: string): Promise<(AdminUser & { user: any }) | null> {
    const result = await query(
      `SELECT 
        au.*,
        jsonb_build_object(
          'id', u.id,
          'email', u.email,
          'firstName', u.first_name,
          'lastName', u.last_name,
          'phone', u.phone,
          'role', u.role,
          'isActive', u.is_active,
          'emailVerified', u.email_verified
        ) as user
      FROM admin_users au
      INNER JOIN users u ON au.user_id = u.id
      WHERE au.user_id = $1 AND au.is_active = true AND au.is_suspended = false`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      ...row,
      user: row.user,
    } as any;
  }

  /**
   * Update last login for admin
   */
  async updateLastLogin(adminUserId: string): Promise<void> {
    await query(
      'UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [adminUserId]
    );
  }

  /**
   * Check if user is suspended
   */
  async isSuspended(userId: string): Promise<boolean> {
    const result = await query(
      'SELECT is_suspended FROM admin_users WHERE user_id = $1',
      [userId]
    );
    return result.rows.length > 0 && result.rows[0].is_suspended === true;
  }

  /**
   * Check if account is locked (from account_locks table)
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const result = await query(
      `SELECT COUNT(*) as count FROM account_locks 
       WHERE user_id = $1 
       AND (locked_until IS NULL OR locked_until > CURRENT_TIMESTAMP)
       AND is_permanent = false`,
      [userId]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

export default new AdminService();

