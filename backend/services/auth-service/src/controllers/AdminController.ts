import { Request, Response } from 'express';
import { transaction } from '../config/database';
import UserService from '../services/UserService';
import AdminService from '../services/AdminService';
import TokenService from '../services/TokenService';
import LoginAttemptService from '../services/LoginAttemptService';
import { comparePassword, validatePasswordStrength } from '../helpers/password.helper';
import { getDeviceId, getDeviceInfo, getDeviceType } from '../helpers/device.helper';
import { validateSignup, validateLogin } from '../validators/admin.validator';
import { hashToken } from '../helpers/jwt.helper';
import { SignupResponse, LoginResponse } from '../types/admin.types';
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
}

export { AdminController };

