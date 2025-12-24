import { Request, Response } from 'express';
import { transaction, query } from '../config/database';
import UserService from '../services/UserService';
import AdminService from '../services/AdminService';
import TokenService from '../services/TokenService';
import LoginAttemptService from '../services/LoginAttemptService';
import PasswordResetService from '../services/PasswordResetService';
import { comparePassword, validatePasswordStrength } from '../helpers/password.helper';
import { getDeviceId, getDeviceInfo, getDeviceType } from '../helpers/device.helper';
import { validateSignup, validateLogin } from '../validators/admin.validator';
import { hashToken } from '../helpers/jwt.helper';
import { SignupResponse, LoginResponse } from '../types/admin.types';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

class AdminController {
  /**
   * Universal Admin Signup
   * POST /api/admin/auth/signup
   */
  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = validateSignup(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { email, password, firstName, lastName, phone } = value;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
        return;
      }

      // Check if email already exists (for universal admin, tenant_id should be null)
      const emailExists = await UserService.emailExists(email, null);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      // Hash password before transaction
      const { hashPassword } = await import('../helpers/password.helper');
      const passwordHash = await hashPassword(password);

      // Create user and admin in transaction
      const result = await transaction(async (client) => {
        // Create user
        const userResult = await client.query(
          `INSERT INTO users (
            tenant_id, email, password_hash, first_name, last_name, phone, role,
            email_verified, phone_verified, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            null, // tenant_id for universal admin
            email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            phone || null,
            'super_admin',
            false,
            false,
            true,
          ]
        );

        const user = userResult.rows[0];

        // Get or create Universal Admin role
        let roleResult = await client.query(
          "SELECT id FROM admin_roles WHERE role_code = 'universal_admin'"
        );

        if (roleResult.rows.length === 0) {
          roleResult = await client.query(
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

        const adminRoleId = roleResult.rows[0].id;

        // Create admin user
        const adminResult = await client.query(
          `INSERT INTO admin_users (
            user_id, tenant_id, admin_role_id, admin_role_code,
            assigned_tenant_id, assigned_departments, is_active,
            is_suspended, two_factor_enabled, assigned_at,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            user.id,
            null,
            adminRoleId,
            'universal_admin',
            null,
            null,
            true,
            false,
            false,
          ]
        );

        return {
          user,
          admin: adminResult.rows[0],
        };
      });

      const response: SignupResponse = {
        success: true,
        message: 'Universal Admin account created successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            adminRoleCode: 'universal_admin',
          },
        },
      };

      // Audit log for security compliance
      logger.security('Admin account created', {
        userId: result.user.id,
        email: result.user.email,
        action: 'signup',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json(response);
    } catch (error: any) {
      // Log error without exposing sensitive data
      const signupEmail = req.body?.email ? '***REDACTED***' : undefined;
      logger.error('Signup failed', error, {
        action: 'signup',
        email: signupEmail,
      });
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        // Never expose error details in production
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Universal Admin Login
   * POST /api/admin/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = validateLogin(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const { email, password } = value;

      // Get device information
      const deviceId = getDeviceId(req);
      const deviceInfo = getDeviceInfo(req);
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';

      // Audit log login attempt (before authentication)
      logger.security('Login attempt initiated', {
        email: '***REDACTED***', // Never log actual email in audit logs
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
      });

      // Find user
      const user = await UserService.findByEmail(email);
      if (!user) {
        // Record failed attempt
        await LoginAttemptService.recordAttempt({
          email,
          ipAddress,
          userAgent,
          attemptType: 'password',
          success: false,
          failureReason: 'Invalid credentials',
        });

        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Check if account is locked
      const isLocked = await AdminService.isAccountLocked(user.id);
      if (isLocked) {
        res.status(403).json({
          success: false,
          message: 'Account is locked. Please contact support.',
        });
        return;
      }

      // Check if admin is suspended
      const admin = await AdminService.findByUserId(user.id);
      if (!admin) {
        res.status(403).json({
          success: false,
          message: 'Admin account not found',
        });
        return;
      }

      if (admin.isSuspended) {
        res.status(403).json({
          success: false,
          message: `Account is suspended. Reason: ${admin.suspensionReason || 'Contact support'}`,
        });
        return;
      }

      // Verify password
      if (!user.passwordHash) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      const passwordValid = await comparePassword(password, user.passwordHash);
      if (!passwordValid) {
        // Record failed attempt
        await LoginAttemptService.recordAttempt({
          userId: user.id,
          email,
          tenantId: user.tenantId,
          ipAddress,
          userAgent,
          attemptType: 'password',
          success: false,
          failureReason: 'Invalid password',
        });

        // Check if account should be locked
        const shouldLock = await LoginAttemptService.shouldLockAccount(email);
        if (shouldLock) {
          // Lock account
          await import('../config/database').then(({ query }) =>
            query(
              `INSERT INTO account_locks (
                user_id, tenant_id, lock_type, lock_reason, locked_at, failed_attempts, is_permanent
              ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, false)
              ON CONFLICT DO NOTHING`,
              [
                user.id,
                user.tenantId,
                'failed_attempts',
                'Too many failed login attempts',
                5,
              ]
            )
          );
        }

        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
        return;
      }

      // Generate tokens
      const tokenPair = await TokenService.createTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
        adminRoleCode: admin.adminRoleCode,
        tenantId: user.tenantId,
        deviceId,
        deviceInfo,
        ipAddress,
        userAgent,
      });

      // Create session
      await import('../config/database').then(({ query }) =>
        query(
          `INSERT INTO user_sessions (
            user_id, tenant_id, session_token, access_token_id, refresh_token_id,
            device_id, device_name, device_type, ip_address, user_agent,
            login_method, logged_in_at, expires_at, is_active, is_current, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, $12, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT DO NOTHING`,
          [
            user.id,
            user.tenantId,
            hashToken(tokenPair.accessToken),
            tokenPair.accessTokenRecord.id,
            tokenPair.refreshTokenRecord.id,
            deviceId,
            userAgent,
            getDeviceType(userAgent),
            ipAddress,
            userAgent,
            'password',
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          ]
        )
      );

      // Update last login
      await UserService.updateLastLogin(user.id);
      await AdminService.updateLastLogin(admin.id);

      // Record successful login attempt
      await LoginAttemptService.recordAttempt({
        userId: user.id,
        email,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        attemptType: 'password',
        success: true,
      });

      // Security audit log for successful login
      logger.security('Admin login successful', {
        userId: user.id,
        email: '***REDACTED***',
        role: user.role,
        adminRoleCode: admin.adminRoleCode,
        ipAddress,
        deviceId,
        timestamp: new Date().toISOString(),
      });

      const response: LoginResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            adminRoleCode: admin.adminRoleCode,
          },
          tokens: {
            accessToken: tokenPair.accessToken,
            refreshToken: tokenPair.refreshToken,
            expiresIn: 3600, // 1 hour in seconds
            tokenType: 'Bearer',
          },
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      // Log error without exposing sensitive data
      logger.error('Login failed', error, {
        action: 'login',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        // Never expose error details in production
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Forgot Password - Generate OTP
   * POST /api/admin/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      // Generate OTP and store
      const { otp, expiresAt } = await PasswordResetService.requestPasswordReset(email);

      // Log OTP to console (for development - remove in production)
      logger.info('Password Reset OTP Generated', {
        email: '***REDACTED***',
        otpLength: otp.length,
        expiresAt: expiresAt.toISOString(),
      });

      // In development, show OTP in console
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🔐 ===== PASSWORD RESET OTP =====');
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log(`⏰ Expires at: ${expiresAt.toLocaleString()}`);
        console.log('================================\n');
      }

      // Security audit log
      logger.security('Password reset requested', {
        email: '***REDACTED***',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'OTP has been sent. Please check your console for development.',
        data: {
          // In development, include OTP for testing
          ...(process.env.NODE_ENV === 'development' && { otp }),
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Forgot password failed', error, {
        action: 'forgot_password',
        email: req.body?.email ? '***REDACTED***' : undefined,
      });

      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If the email exists, an OTP has been sent.',
      });
    }
  };

  /**
   * Reset Password with OTP
   * POST /api/admin/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Email, OTP, and new password are required',
        });
        return;
      }

      // Verify OTP
      const { tokenId, userId } = await PasswordResetService.verifyOTP(email, otp);

      // Reset password
      await PasswordResetService.resetPassword(tokenId, newPassword);

      // Revoke all other tokens
      await PasswordResetService.revokeAllTokens(userId);

      // Security audit log
      logger.security('Password reset completed', {
        userId,
        email: '***REDACTED***',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error: any) {
      logger.error('Reset password failed', error, {
        action: 'reset_password',
        email: req.body?.email ? '***REDACTED***' : undefined,
      });

      res.status(400).json({
        success: false,
        message: error.message || 'Invalid or expired OTP',
      });
    }
  };

  /**
   * Logout - Revoke tokens
   * POST /api/admin/auth/logout
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Authorization token required',
        });
        return;
      }

      const token = authHeader.substring(7);
      const tokenHash = hashToken(token);

      // Find token
      const tokenResult = await query(
        `SELECT id, user_id, token_type FROM authentication_tokens 
         WHERE token_hash = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP`,
        [tokenHash]
      );

      if (tokenResult.rows.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
        return;
      }

      const tokenRecord = tokenResult.rows[0];

      // Revoke access token
      await query(
        'UPDATE authentication_tokens SET is_active = false, revoked_at = CURRENT_TIMESTAMP WHERE id = $1',
        [tokenRecord.id]
      );

      // Revoke associated refresh token if exists
      await query(
        `UPDATE authentication_tokens 
         SET is_active = false, revoked_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND token_type = 'refresh_token' AND is_active = true`,
        [tokenRecord.user_id]
      );

      // Deactivate session
      await query(
        `UPDATE user_sessions 
         SET is_active = false, is_current = false, logged_out_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 AND is_active = true`,
        [tokenRecord.user_id]
      );

      // Security audit log
      logger.security('User logged out', {
        userId: tokenRecord.user_id,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout failed', error, {
        action: 'logout',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * List all admins
   * GET /api/admin/admins
   */
  listAdmins = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '20', search = '', role = '' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let sqlQuery = `
        SELECT 
          au.id, au.user_id as "userId", au.admin_role_code as "adminRoleCode",
          au.is_active as "isActive", au.is_suspended as "isSuspended",
          au.last_login_at as "lastLoginAt", au.created_at as "createdAt",
          u.email, u.first_name as "firstName", u.last_name as "lastName",
          u.phone, u.role, ar.role_name as "roleName"
        FROM admin_users au
        INNER JOIN users u ON au.user_id = u.id
        LEFT JOIN admin_roles ar ON au.admin_role_id = ar.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (search) {
        sqlQuery += ` AND (u.email ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      if (role) {
        sqlQuery += ` AND au.admin_role_code = $${paramCount}`;
        params.push(role);
        paramCount++;
      }

      sqlQuery += ` ORDER BY au.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limitNum, offset);

      const result = await query(sqlQuery, params);
      const countResult = await query(
        `SELECT COUNT(*) as total FROM admin_users au INNER JOIN users u ON au.user_id = u.id WHERE 1=1${search ? ` AND (u.email ILIKE '%${search}%' OR u.first_name ILIKE '%${search}%' OR u.last_name ILIKE '%${search}%')` : ''}${role ? ` AND au.admin_role_code = '${role}'` : ''}`
      );

      res.json({
        success: true,
        data: {
          admins: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].total),
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
          },
        },
      });
    } catch (error: any) {
      logger.error('List admins failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list admins',
      });
    }
  };

  /**
   * Create admin
   * POST /api/admin/admins
   */
  createAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone, adminRoleCode = 'sub_admin' } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: 'Email, password, firstName, and lastName are required',
        });
        return;
      }

      // Check if email exists
      const emailExists = await UserService.emailExists(email, null);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      const { hashPassword } = await import('../helpers/password.helper');
      const passwordHash = await hashPassword(password);

      const result = await transaction(async (client) => {
        // Create user
        const userResult = await client.query(
          `INSERT INTO users (
            tenant_id, email, password_hash, first_name, last_name, phone, role,
            email_verified, phone_verified, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            null,
            email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            phone || null,
            'admin',
            false,
            false,
            true,
          ]
        );

        const user = userResult.rows[0];

        // Get admin role
        const roleResult = await client.query(
          'SELECT id FROM admin_roles WHERE role_code = $1',
          [adminRoleCode]
        );

        if (roleResult.rows.length === 0) {
          throw new Error(`Admin role ${adminRoleCode} not found`);
        }

        const adminRoleId = roleResult.rows[0].id;

        // Create admin user
        const adminResult = await client.query(
          `INSERT INTO admin_users (
            user_id, tenant_id, admin_role_id, admin_role_code,
            is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [user.id, null, adminRoleId, adminRoleCode, true]
        );

        return { user, admin: adminResult.rows[0] };
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          admin: {
            id: result.admin.id,
            userId: result.user.id,
            email: result.user.email,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            adminRoleCode: result.admin.admin_role_code,
          },
        },
      });
    } catch (error: any) {
      logger.error('Create admin failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create admin',
      });
    }
  };

  /**
   * Update admin
   * PUT /api/admin/admins/:id
   */
  updateAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, isActive, isSuspended, adminRoleCode } = req.body;

      await transaction(async (client) => {
        // Update user if provided
        if (firstName || lastName || phone !== undefined) {
          const updateFields: string[] = [];
          const params: any[] = [];
          let paramCount = 1;

          if (firstName) {
            updateFields.push(`first_name = $${paramCount++}`);
            params.push(firstName);
          }
          if (lastName) {
            updateFields.push(`last_name = $${paramCount++}`);
            params.push(lastName);
          }
          if (phone !== undefined) {
            updateFields.push(`phone = $${paramCount++}`);
            params.push(phone);
          }
          updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          params.push(id);

          await client.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = (SELECT user_id FROM admin_users WHERE id = $${paramCount})`,
            params
          );
        }

        // Update admin if provided
        if (isActive !== undefined || isSuspended !== undefined || adminRoleCode) {
          const updateFields: string[] = [];
          const params: any[] = [];
          let paramCount = 1;

          if (isActive !== undefined) {
            updateFields.push(`is_active = $${paramCount++}`);
            params.push(isActive);
          }
          if (isSuspended !== undefined) {
            updateFields.push(`is_suspended = $${paramCount++}`);
            params.push(isSuspended);
            if (isSuspended) {
              updateFields.push(`suspended_at = CURRENT_TIMESTAMP`);
            }
          }
          if (adminRoleCode) {
            const roleResult = await client.query(
              'SELECT id FROM admin_roles WHERE role_code = $1',
              [adminRoleCode]
            );
            if (roleResult.rows.length > 0) {
              updateFields.push(`admin_role_id = $${paramCount++}`);
              params.push(roleResult.rows[0].id);
              updateFields.push(`admin_role_code = $${paramCount++}`);
              params.push(adminRoleCode);
            }
          }
          updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          params.push(id);

          await client.query(
            `UPDATE admin_users SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
            params
          );
        }
      });

      res.json({
        success: true,
        message: 'Admin updated successfully',
      });
    } catch (error: any) {
      logger.error('Update admin failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update admin',
      });
    }
  };

  /**
   * List all tenants
   * GET /api/admin/tenants
   */
  listTenants = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '20', search = '', type = '', isActive = '' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let sqlQuery = `
        SELECT 
          t.*,
          (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
          (SELECT COUNT(*) FROM patients WHERE tenant_id = t.id) as patient_count
        FROM tenants t
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (search) {
        sqlQuery += ` AND (t.name ILIKE $${paramCount} OR t.slug ILIKE $${paramCount} OR t.subdomain ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      if (type) {
        sqlQuery += ` AND t.type = $${paramCount}`;
        params.push(type);
        paramCount++;
      }

      if (isActive !== '') {
        sqlQuery += ` AND t.is_active = $${paramCount}`;
        params.push(isActive === 'true');
        paramCount++;
      }

      sqlQuery += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limitNum, offset);

      const result = await query(sqlQuery, params);
      const countResult = await query(
        `SELECT COUNT(*) as total FROM tenants WHERE 1=1${search ? ` AND (name ILIKE '%${search}%' OR slug ILIKE '%${search}%' OR subdomain ILIKE '%${search}%')` : ''}${type ? ` AND type = '${type}'` : ''}${isActive !== '' ? ` AND is_active = ${isActive === 'true'}` : ''}`
      );

      res.json({
        success: true,
        data: {
          tenants: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].total),
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
          },
        },
      });
    } catch (error: any) {
      logger.error('List tenants failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to list tenants',
      });
    }
  };

  /**
   * Create tenant
   * POST /api/admin/tenants
   */
  createTenant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const {
        name,
        slug,
        type,
        customDomain,
        subdomain,
        subscriptionTier = 'freemium',
        maxUsers = 10,
        maxPatients = 100,
        maxStorageGb = 10,
      } = req.body;

      if (!name || !slug || !type) {
        res.status(400).json({
          success: false,
          message: 'Name, slug, and type are required',
        });
        return;
      }

      const result = await query(
        `INSERT INTO tenants (
          name, slug, type, custom_domain, subdomain, subscription_tier,
          subscription_start, max_users, max_patients, max_storage_gb,
          is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [name, slug, type, customDomain || null, subdomain || null, subscriptionTier, maxUsers, maxPatients, maxStorageGb]
      );

      res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: {
          tenant: result.rows[0],
        },
      });
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          message: 'Tenant with this slug, subdomain, or domain already exists',
        });
        return;
      }
      logger.error('Create tenant failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create tenant',
      });
    }
  };

  /**
   * Update tenant
   * PUT /api/admin/tenants/:id
   */
  updateTenant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const allowedFields = [
        'name', 'slug', 'type', 'custom_domain', 'subdomain',
        'subscription_tier', 'subscription_end', 'max_users',
        'max_patients', 'max_storage_gb', 'is_active'
      ];

      const updateFields: string[] = [];
      const params: any[] = [];
      let paramCount = 1;

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updateFields.push(`${field} = $${paramCount++}`);
          params.push(updateData[field]);
        }
      }

      if (updateFields.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid fields to update',
        });
        return;
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      await query(
        `UPDATE tenants SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        params
      );

      res.json({
        success: true,
        message: 'Tenant updated successfully',
      });
    } catch (error: any) {
      logger.error('Update tenant failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update tenant',
      });
    }
  };

  /**
   * Get dashboard stats
   * GET /api/admin/dashboard/stats
   */
  getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [usersResult, tenantsResult, adminsResult, appointmentsResult] = await Promise.all([
        query('SELECT COUNT(*) as total FROM users'), // Count all users including admins
        query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM tenants'),
        query('SELECT COUNT(*) as total FROM admin_users WHERE is_active = true AND is_suspended = false'),
        query('SELECT COUNT(*) as total FROM appointments WHERE status = \'confirmed\' AND appointment_date >= CURRENT_DATE'),
      ]);

      const stats = {
        totalUsers: parseInt(usersResult.rows[0].total),
        totalTenants: parseInt(tenantsResult.rows[0].total),
        activeTenants: parseInt(tenantsResult.rows[0].active),
        totalAdmins: parseInt(adminsResult.rows[0].total),
        upcomingAppointments: parseInt(appointmentsResult.rows[0].total),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Get dashboard stats failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get dashboard stats',
      });
    }
  };

  /**
   * Get analytics
   * GET /api/admin/analytics
   */
  getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string);

      const [
        usersResult,
        tenantsResult,
        appointmentsResult,
        revenueResult,
      ] = await Promise.all([
        query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent
          FROM users WHERE tenant_id IS NOT NULL
        `),
        query(`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days') as recent
          FROM tenants
        `),
        query(`
          SELECT COUNT(*) as total FROM appointments 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        `),
        query(`
          SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices 
          WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days' AND status = 'paid'
        `),
      ]);

      res.json({
        success: true,
        data: {
          users: {
            total: parseInt(usersResult.rows[0].total),
            recent: parseInt(usersResult.rows[0].recent),
          },
          tenants: {
            total: parseInt(tenantsResult.rows[0].total),
            recent: parseInt(tenantsResult.rows[0].recent),
          },
          appointments: parseInt(appointmentsResult.rows[0].total),
          revenue: parseFloat(revenueResult.rows[0].total || '0'),
        },
      });
    } catch (error: any) {
      logger.error('Get analytics failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get analytics',
      });
    }
  };

  /**
   * Get billing info
   * GET /api/admin/billing
   */
  getBilling = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [revenueResult, subscriptionsResult, pendingResult] = await Promise.all([
        query(`
          SELECT COALESCE(SUM(total_amount), 0) as total 
          FROM invoices 
          WHERE status = 'paid' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        `),
        query(`
          SELECT COUNT(*) as total FROM tenants 
          WHERE subscription_tier != 'freemium' AND is_active = true
        `),
        query(`
          SELECT COALESCE(SUM(total_amount), 0) as total 
          FROM invoices 
          WHERE status = 'pending' OR status = 'overdue'
        `),
      ]);

      res.json({
        success: true,
        data: {
          totalRevenue: parseFloat(revenueResult.rows[0].total || '0'),
          activeSubscriptions: parseInt(subscriptionsResult.rows[0].total),
          pendingPayments: parseFloat(pendingResult.rows[0].total || '0'),
        },
      });
    } catch (error: any) {
      logger.error('Get billing failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get billing info',
      });
    }
  };

  /**
   * Get security info
   * GET /api/admin/security
   */
  getSecurity = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [sessionsResult, failedLoginsResult] = await Promise.all([
        query(`
          SELECT COUNT(*) as total FROM user_sessions 
          WHERE is_active = true AND is_current = true
        `),
        query(`
          SELECT COUNT(*) as total FROM login_attempts 
          WHERE success = false AND attempted_at >= CURRENT_DATE - INTERVAL '24 hours'
        `),
      ]);

      res.json({
        success: true,
        data: {
          activeSessions: parseInt(sessionsResult.rows[0].total),
          failedLogins24h: parseInt(failedLoginsResult.rows[0].total),
          securityScore: 98, // Placeholder
        },
      });
    } catch (error: any) {
      logger.error('Get security failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get security info',
      });
    }
  };

  /**
   * Get audit logs
   * GET /api/admin/logs
   */
  getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page = '1', limit = '50', type = '' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let sqlQuery = `
        SELECT 
          id, user_id as "userId", action, resource_type as "resourceType",
          resource_id as "resourceId", ip_address as "ipAddress",
          user_agent as "userAgent", created_at as "createdAt"
        FROM audit_logs
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramCount = 1;

      if (type) {
        sqlQuery += ` AND action = $${paramCount}`;
        params.push(type);
        paramCount++;
      }

      sqlQuery += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limitNum, offset);

      const result = await query(sqlQuery, params);
      const countResult = await query(
        `SELECT COUNT(*) as total FROM audit_logs${type ? ` WHERE action = '${type}'` : ''}`
      );

      res.json({
        success: true,
        data: {
          logs: result.rows,
          pagination: {
            total: parseInt(countResult.rows[0].total),
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
          },
        },
      });
    } catch (error: any) {
      logger.error('Get audit logs failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get audit logs',
      });
    }
  };

  /**
   * Get settings
   * GET /api/admin/settings
   */
  getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Placeholder - implement based on your settings table structure
      res.json({
        success: true,
        data: {
          settings: {
            platformName: 'VirtualDoc',
            emailEnabled: true,
            mfaEnabled: true,
          },
        },
      });
    } catch (error: any) {
      logger.error('Get settings failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get settings',
      });
    }
  };

  /**
   * Update settings
   * PUT /api/admin/settings
   */
  updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Placeholder - implement based on your settings table structure
      res.json({
        success: true,
        message: 'Settings updated successfully',
      });
    } catch (error: any) {
      logger.error('Update settings failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update settings',
      });
    }
  };

  /**
   * Create user (from admin panel)
   * POST /api/admin/users
   */
  createUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone, role = 'patient', tenantId } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: 'Email, password, firstName, and lastName are required',
        });
        return;
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          success: false,
          message: passwordValidation.message,
        });
        return;
      }

      // Check if email already exists
      const emailExists = await UserService.emailExists(email, tenantId || null);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      const { hashPassword } = await import('../helpers/password.helper');
      const passwordHash = await hashPassword(password);

      const result = await transaction(async (client) => {
        // Create user
        const userResult = await client.query(
          `INSERT INTO users (
            tenant_id, email, password_hash, first_name, last_name, phone, role,
            email_verified, phone_verified, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [
            tenantId || null,
            email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            phone || null,
            role,
            false,
            false,
            true,
          ]
        );

        return { user: userResult.rows[0] };
      });

      // Security audit log
      logger.security('User created by admin', {
        userId: result.user.id,
        email: result.user.email,
        createdBy: req.user?.userId,
        action: 'create_user',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            role: result.user.role,
          },
        },
      });
    } catch (error: any) {
      logger.error('Create user failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create user',
      });
    }
  };

  /**
   * Search users (proxy to user-service)
   * GET /api/users/search
   */
  searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { page, limit, search, role } = req.query;
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3000';
      const token = req.headers.authorization;

      // Build query string
      const queryParams = new URLSearchParams();
      if (page) queryParams.append('page', page as string);
      if (limit) queryParams.append('limit', limit as string);
      if (search) queryParams.append('search', search as string);
      if (role) queryParams.append('role', role as string);

      const url = `${userServiceUrl}/api/users/search?${queryParams.toString()}`;

      // Forward request to user-service
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json(data);
        return;
      }

      res.json(data);
    } catch (error: any) {
      logger.error('Search users failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search users',
      });
    }
  };

  /**
   * Proxy methods for roles and permissions (forward to user-service)
   */
  private async proxyToUserService(req: AuthRequest, res: Response, path: string, method: string = 'GET', body?: any): Promise<void> {
    try {
      const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3000';
      const token = req.headers.authorization;
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `${userServiceUrl}${path}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': token || '',
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      logger.error(`Proxy to user-service failed: ${path}`, error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to proxy request',
      });
    }
  }

  // Proxy endpoints
  getAllPermissions = async (req: AuthRequest, res: Response) => {
    await this.proxyToUserService(req, res, '/api/permissions', 'GET');
  };

  createPermission = async (req: AuthRequest, res: Response) => {
    await this.proxyToUserService(req, res, '/api/permissions', 'POST', req.body);
  };

  getRolePermissions = async (req: AuthRequest, res: Response) => {
    const { role } = req.params;
    await this.proxyToUserService(req, res, `/api/roles/${role}/permissions`, 'GET');
  };

  assignRolePermission = async (req: AuthRequest, res: Response) => {
    const { role } = req.params;
    await this.proxyToUserService(req, res, `/api/roles/${role}/permissions`, 'POST', req.body);
  };
}

export { AdminController };

