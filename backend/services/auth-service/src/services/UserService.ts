import { query } from '../config/database';
import { hashPassword } from '../helpers/password.helper';
import { User } from '../types/admin.types';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    const passwordHash = await hashPassword(data.password);
    const role = data.role || 'super_admin';

    const result = await query(
      `INSERT INTO users (
        tenant_id, email, password_hash, first_name, last_name, phone, role,
        email_verified, phone_verified, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        null, // tenant_id for universal admin
        data.email.toLowerCase(),
        passwordHash,
        data.firstName,
        data.lastName,
        data.phone || null,
        role,
        false, // email_verified
        false, // phone_verified
        true, // is_active
      ]
    );

    return result.rows[0] as User;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0] as User || null;
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] as User || null;
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
   * Check if email already exists
   */
  async emailExists(email: string, tenantId?: string | null): Promise<boolean> {
    if (tenantId !== undefined && tenantId !== null) {
      const result = await query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1 AND tenant_id = $2',
        [email.toLowerCase(), tenantId]
      );
      return parseInt(result.rows[0].count) > 0;
    } else {
      // For universal admin, check for email with tenant_id IS NULL
      const result = await query(
        'SELECT COUNT(*) as count FROM users WHERE email = $1 AND (tenant_id IS NULL OR tenant_id = $2)',
        [email.toLowerCase(), tenantId]
      );
      return parseInt(result.rows[0].count) > 0;
    }
  }
}

export default new UserService();

