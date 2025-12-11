import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import UserService from '../services/UserService';
import { validateUpdateProfile, validateUpdatePreferences, validateUserSearch } from '../validators/user.validator';

class UserController {
  /**
   * Get current user profile
   * GET /api/users/profile
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const user = await UserService.getUserById(
        req.user.userId,
        req.user.tenantId
      );

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Remove sensitive data
      const { password_hash, ...profile } = user as any;

      res.json({
        success: true,
        data: {
          user: {
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
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user profile',
      });
    }
  };

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validateUpdateProfile(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const user = await UserService.updateUserProfile(
        req.user.userId,
        value,
        req.user.tenantId
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            isActive: user.isActive,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  };

  /**
   * Get user by ID
   * GET /api/users/:userId
   */
  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { userId } = req.params;

      // Check if user can access this profile
      const isOwnProfile = userId === req.user.userId;
      const isAdmin = ['super_admin', 'admin', 'sub_admin'].includes(req.user.role) ||
                      req.user.adminRoleCode === 'universal_admin';

      if (!isOwnProfile && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
        });
        return;
      }

      const user = await UserService.getUserById(userId, req.user.tenantId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user',
      });
    }
  };

  /**
   * Get user preferences
   * GET /api/users/preferences
   */
  getPreferences = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const preferences = await UserService.getUserPreferences(req.user.userId);

      res.json({
        success: true,
        data: {
          preferences,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get preferences',
      });
    }
  };

  /**
   * Update user preferences
   * PUT /api/users/preferences
   */
  updatePreferences = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { error, value } = validateUpdatePreferences(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const preferences = await UserService.updateUserPreferences(
        req.user.userId,
        value
      );

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: {
          preferences,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update preferences',
      });
    }
  };

  /**
   * Search users
   * GET /api/users/search
   */
  searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Only admins can search users
      const isAdmin = ['super_admin', 'admin', 'sub_admin'].includes(req.user.role) ||
                      req.user.adminRoleCode === 'universal_admin';

      if (!isAdmin) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
        });
        return;
      }

      const { error, value } = validateUserSearch(req.query);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const result = await UserService.searchUsers(value, req.user.tenantId);

      res.json({
        success: true,
        data: {
          users: result.users.map(user => ({
            id: user.id,
            tenantId: user.tenantId,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
          })),
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to search users',
      });
    }
  };
}

export default UserController;

