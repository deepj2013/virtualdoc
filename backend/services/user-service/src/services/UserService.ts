import { query, transaction } from '../config/database';
import { User, UserProfile, UpdateUserProfileDto, UserPreferences, UpdateUserPreferencesDto, UserSearchParams } from '../types/user.types';

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId: string, requesterTenantId: string | null = null): Promise<User | null> {
    const result = await query(
      `SELECT 
        id, tenant_id, email, phone, phone_verified, email_verified,
        first_name, last_name, middle_name, date_of_birth, gender,
        profile_picture_url, role, is_active, last_login_at,
        mfa_enabled, created_at, updated_at
      FROM users 
      WHERE id = $1 
        AND (tenant_id = $2 OR $2 IS NULL OR tenant_id IS NULL)`,
      [userId, requesterTenantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string, tenantId: string | null = null): Promise<User | null> {
    const result = await query(
      `SELECT 
        id, tenant_id, email, phone, phone_verified, email_verified,
        first_name, last_name, middle_name, date_of_birth, gender,
        profile_picture_url, role, is_active, last_login_at,
        mfa_enabled, created_at, updated_at
      FROM users 
      WHERE email = $1 
        AND (tenant_id = $2 OR $2 IS NULL OR tenant_id IS NULL)`,
      [email.toLowerCase(), tenantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileDto,
    requesterTenantId: string | null = null
  ): Promise<User> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updateData.firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(updateData.firstName);
    }
    if (updateData.lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(updateData.lastName);
    }
    if (updateData.middleName !== undefined) {
      updates.push(`middle_name = $${paramCount++}`);
      values.push(updateData.middleName);
    }
    if (updateData.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(updateData.phone);
    }
    if (updateData.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(updateData.dateOfBirth);
    }
    if (updateData.gender !== undefined) {
      updates.push(`gender = $${paramCount++}`);
      values.push(updateData.gender);
    }
    if (updateData.profilePictureUrl !== undefined) {
      updates.push(`profile_picture_url = $${paramCount++}`);
      values.push(updateData.profilePictureUrl);
    }

    if (updates.length === 0) {
      const user = await this.getUserById(userId, requesterTenantId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId, requesterTenantId);

    const result = await query(
      `UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} 
        AND (tenant_id = $${paramCount++} OR $${paramCount - 1} IS NULL OR tenant_id IS NULL)
      RETURNING 
        id, tenant_id, email, phone, phone_verified, email_verified,
        first_name, last_name, middle_name, date_of_birth, gender,
        profile_picture_url, role, is_active, last_login_at,
        mfa_enabled, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found or access denied');
    }

    return this.mapRowToUser(result.rows[0]);
  }

  /**
   * Get user preferences
   * Note: user_preferences table may not exist in schema yet
   * Returns default preferences for now
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Check if table exists, if not return defaults
    try {
      const result = await query(
        `SELECT * FROM user_preferences WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        // Return default preferences if none exist
        return {
          userId,
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '12h',
          theme: 'light',
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      const row = result.rows[0];
      return {
        userId: row.user_id,
        language: row.language || 'en',
        timezone: row.timezone || 'UTC',
        dateFormat: row.date_format || 'YYYY-MM-DD',
        timeFormat: row.time_format || '12h',
        theme: row.theme || 'light',
        notifications: row.notifications || {
          email: true,
          sms: false,
          push: true,
        },
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error: any) {
      // Table doesn't exist, return defaults
      if (error.code === '42P01') {
        return {
          userId,
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '12h',
          theme: 'light',
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      throw error;
    }
  }

  /**
   * Update user preferences
   * Note: user_preferences table may not exist in schema yet
   */
  async updateUserPreferences(
    userId: string,
    preferences: UpdateUserPreferencesDto
  ): Promise<UserPreferences> {
    return await transaction(async (client) => {
      // Check if table exists
      try {
        // Check if preferences exist
        const existing = await client.query(
          `SELECT * FROM user_preferences WHERE user_id = $1`,
          [userId]
        );

      if (existing.rows.length === 0) {
        // Create new preferences
        const result = await client.query(
          `INSERT INTO user_preferences (
            user_id, language, timezone, date_format, time_format, theme, notifications
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            userId,
            preferences.language || 'en',
            preferences.timezone || 'UTC',
            preferences.dateFormat || 'YYYY-MM-DD',
            preferences.timeFormat || '12h',
            preferences.theme || 'light',
            JSON.stringify(preferences.notifications || { email: true, sms: false, push: true }),
          ]
        );

        const row = result.rows[0];
        return {
          userId: row.user_id,
          language: row.language,
          timezone: row.timezone,
          dateFormat: row.date_format,
          timeFormat: row.time_format,
          theme: row.theme,
          notifications: row.notifications,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      } else {
        // Update existing preferences
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (preferences.language !== undefined) {
          updates.push(`language = $${paramCount++}`);
          values.push(preferences.language);
        }
        if (preferences.timezone !== undefined) {
          updates.push(`timezone = $${paramCount++}`);
          values.push(preferences.timezone);
        }
        if (preferences.dateFormat !== undefined) {
          updates.push(`date_format = $${paramCount++}`);
          values.push(preferences.dateFormat);
        }
        if (preferences.timeFormat !== undefined) {
          updates.push(`time_format = $${paramCount++}`);
          values.push(preferences.timeFormat);
        }
        if (preferences.theme !== undefined) {
          updates.push(`theme = $${paramCount++}`);
          values.push(preferences.theme);
        }
        if (preferences.notifications !== undefined) {
          updates.push(`notifications = $${paramCount++}`);
          values.push(JSON.stringify(preferences.notifications));
        }

        if (updates.length === 0) {
          const row = existing.rows[0];
          return {
            userId: row.user_id,
            language: row.language,
            timezone: row.timezone,
            dateFormat: row.date_format,
            timeFormat: row.time_format,
            theme: row.theme,
            notifications: row.notifications,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          };
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(userId);

        const result = await client.query(
          `UPDATE user_preferences 
          SET ${updates.join(', ')}
          WHERE user_id = $${paramCount++}
          RETURNING *`,
          values
        );

        const row = result.rows[0];
        return {
          userId: row.user_id,
          language: row.language,
          timezone: row.timezone,
          dateFormat: row.date_format,
          timeFormat: row.time_format,
          theme: row.theme,
          notifications: row.notifications,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
      } catch (error: any) {
        // Table doesn't exist, return defaults with updated values
        if (error.code === '42P01') {
          return {
            userId,
            language: preferences.language || 'en',
            timezone: preferences.timezone || 'UTC',
            dateFormat: preferences.dateFormat || 'YYYY-MM-DD',
            timeFormat: preferences.timeFormat || '12h',
            theme: preferences.theme || 'light',
            notifications: preferences.notifications || {
              email: true,
              sms: false,
              push: true,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        throw error;
      }
    });
  }

  /**
   * Search users
   */
  async searchUsers(params: UserSearchParams, requesterTenantId: string | null = null): Promise<{
    users: User[];
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
    if (requesterTenantId !== null) {
      conditions.push(`(tenant_id = $${paramCount++} OR tenant_id IS NULL)`);
      values.push(requesterTenantId);
    }

    // Search term
    if (params.search) {
      conditions.push(
        `(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`
      );
      values.push(`%${params.search}%`);
      paramCount++;
    }

    // Role filter
    if (params.role) {
      conditions.push(`role = $${paramCount++}`);
      values.push(params.role);
    }

    // Active filter
    if (params.isActive !== undefined) {
      conditions.push(`is_active = $${paramCount++}`);
      values.push(params.isActive);
    }

    // Tenant filter
    if (params.tenantId) {
      conditions.push(`tenant_id = $${paramCount++}`);
      values.push(params.tenantId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get users
    const usersResult = await query(
      `SELECT 
        id, tenant_id, email, phone, phone_verified, email_verified,
        first_name, last_name, middle_name, date_of_birth, gender,
        profile_picture_url, role, is_active, last_login_at,
        mfa_enabled, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}`,
      [...values, limit, offset]
    );

    return {
      users: usersResult.rows.map(row => this.mapRowToUser(row)),
      total,
      page,
      limit,
    };
  }

  /**
   * Map database row to User object
   */
  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      email: row.email,
      phone: row.phone,
      phoneVerified: row.phone_verified,
      emailVerified: row.email_verified,
      firstName: row.first_name,
      lastName: row.last_name,
      middleName: row.middle_name,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      profilePictureUrl: row.profile_picture_url,
      role: row.role,
      isActive: row.is_active,
      lastLoginAt: row.last_login_at,
      mfaEnabled: row.mfa_enabled,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new UserService();

