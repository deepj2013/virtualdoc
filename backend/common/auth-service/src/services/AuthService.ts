import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/UserRepository';
import { RedisService } from './RedisService';
import { EmailService } from './EmailService';
import { logger } from '../utils/logger';
import { User, RegisterData, LoginResult } from '../types/User';

export class AuthService {
  private userRepository: UserRepository;
  private redisService: RedisService;
  private emailService: EmailService;

  constructor() {
    this.userRepository = new UserRepository();
    this.redisService = new RedisService();
    this.emailService = new EmailService();
  }

  public async register(data: RegisterData): Promise<LoginResult> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'doctor',
        organizationId: data.organizationId,
        isEmailVerified: false,
        isActive: true,
        lastLoginAt: null
      };

      const user = await this.userRepository.create(userData);

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token in Redis
      await this.redisService.setRefreshToken(user.id, refreshToken);

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.id);

      logger.info(`User registered successfully: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Store refresh token in Redis
      await this.redisService.setRefreshToken(user.id, refreshToken);

      logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: this.sanitizeUser(user),
        token,
        refreshToken
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  public async logout(userId: string, token: string): Promise<void> {
    try {
      // Add token to blacklist
      await this.redisService.blacklistToken(token);
      
      // Remove refresh token
      await this.redisService.removeRefreshToken(userId);

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }

  public async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.getRefreshToken(decoded.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update refresh token in Redis
      await this.redisService.setRefreshToken(user.id, newRefreshToken);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new Error('Invalid refresh token');
    }
  }

  public async getCurrentUser(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      logger.error('Get current user failed:', error);
      throw error;
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not
        return;
      }

      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token
      await this.redisService.setPasswordResetToken(email, resetToken, 3600);

      // Send reset email
      await this.emailService.sendPasswordResetEmail(email, resetToken);

      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Get email from token
      const email = await this.redisService.getPasswordResetEmail(token);
      if (!email) {
        throw new Error('Invalid or expired reset token');
      }

      // Find user
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.userRepository.updatePassword(user.id, hashedPassword);

      // Remove reset token
      await this.redisService.removePasswordResetToken(token);

      logger.info(`Password reset successful for: ${email}`);
    } catch (error) {
      logger.error('Reset password failed:', error);
      throw error;
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      // Get user ID from token
      const userId = await this.redisService.getEmailVerificationUserId(token);
      if (!userId) {
        throw new Error('Invalid or expired verification token');
      }

      // Update user email verification status
      await this.userRepository.verifyEmail(userId);

      // Remove verification token
      await this.redisService.removeEmailVerificationToken(token);

      logger.info(`Email verified for user: ${userId}`);
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw error;
    }
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.userRepository.updatePassword(user.id, hashedPassword);

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Change password failed:', error);
      throw error;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    };

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'virtualdoc-auth-service'
    });
  }

  private generateRefreshToken(user: User): string {
    const payload = {
      userId: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'virtualdoc-auth-service'
    });
  }

  private sanitizeUser(user: User): User {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser as User;
  }
}
