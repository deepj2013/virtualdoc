import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/ApiResponse';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role, organizationId } = req.body;
      
      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
        organizationId
      });

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      const result = await this.authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(401).json(response);
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (userId && token) {
        await this.authService.logout(userId, token);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.json(response);
    } catch (error) {
      logger.error('Logout error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Logout failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      const result = await this.authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: result.token,
          refreshToken: result.refreshToken
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Token refresh error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Token refresh failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(401).json(response);
    }
  };

  public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'No user ID found in token'
        };
        res.status(401).json(response);
        return;
      }

      const user = await this.authService.getCurrentUser(userId);

      const response: ApiResponse = {
        success: true,
        message: 'User data retrieved successfully',
        data: { user }
      };

      res.json(response);
    } catch (error) {
      logger.error('Get current user error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get user data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      await this.authService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Forgot password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send password reset email',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      
      await this.authService.resetPassword(token, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Reset password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Password reset failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;
      
      await this.authService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Email verification error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Email verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };

  public changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated',
          error: 'No user ID found in token'
        };
        res.status(401).json(response);
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully'
      };

      res.json(response);
    } catch (error) {
      logger.error('Change password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Password change failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  };
}
