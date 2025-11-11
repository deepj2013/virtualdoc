import { Request, Response } from 'express';
import UserService from '../services/UserService';
import RoleService from '../services/RoleService';
import PermissionService from '../services/PermissionService';
import {
  validateCreateUser,
  validateUpdateUser,
  validateCreateUserRole,
  validateCreatePermission,
  validateAssignRolePermission,
} from '../validators/user.validator';
import { validatePasswordStrength } from '../helpers/password.helper';
import logger from '../utils/logger';
import {
  CreateUserResponse,
  UpdateUserResponse,
  UserDetailResponse,
  UserListResponse,
} from '../types/user.types';

class UserController {
  /**
   * Create user
   * POST /api/users
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = validateCreateUser(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      const data = value;

      // Validate password if provided
      if (data.password) {
        const passwordValidation = validatePasswordStrength(data.password);
        if (!passwordValidation.valid) {
          res.status(400).json({
            success: false,
            message: passwordValidation.message,
          });
          return;
        }
      }

      // Check if email already exists
      const emailExists = await UserService.emailExists(data.email, data.tenantId);
      if (emailExists) {
        res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
        return;
      }

      // Create user
      const user = await UserService.createUser(data);

      // Security audit log
      logger.security('User created', {
        userId: user.id,
        email: '***REDACTED***',
        role: user.role,
        tenantId: user.tenantId,
        action: 'create_user',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      const response: CreateUserResponse = {
        success: true,
        message: 'User created successfully',
        data: {
          user: UserService.formatUserResponse(user),
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Create user failed', error, {
        action: 'create_user',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.query.tenantId as string | undefined;

      const user = await UserService.findById(id, tenantId || null);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Get user roles
      const roles = await UserService.getUserRoles(id, tenantId || null);

      const response: UserDetailResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: UserService.formatUserResponse(user),
          roles,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Get user failed', error, {
        action: 'get_user',
        userId: req.params.id,
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Update user
   * PUT /api/users/:id
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.query.tenantId as string | undefined;

      // Validate request body
      const { error, value } = validateUpdateUser(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Update user
      const user = await UserService.updateUser(id, value, tenantId || null);

      // Security audit log
      logger.security('User updated', {
        userId: user.id,
        action: 'update_user',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      const response: UpdateUserResponse = {
        success: true,
        message: 'User updated successfully',
        data: {
          user: UserService.formatUserResponse(user),
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Update user failed', error, {
        action: 'update_user',
        userId: req.params.id,
      });

      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.query.tenantId as string | undefined;

      await UserService.deleteUser(id, tenantId || null);

      // Security audit log
      logger.security('User deleted', {
        userId: id,
        action: 'delete_user',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete user failed', error, {
        action: 'delete_user',
        userId: req.params.id,
      });

      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * List users
   * GET /api/users
   */
  listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.query.tenantId as string | undefined;
      const role = req.query.role as string | undefined;
      const departmentId = req.query.departmentId as string | undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UserService.listUsers(
        tenantId || null,
        role,
        departmentId,
        isActive,
        page,
        limit
      );

      const response: UserListResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: result.users.map((user) => UserService.formatUserResponse(user)),
          total: result.total,
          page,
          limit,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      logger.error('List users failed', error, {
        action: 'list_users',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Create user role
   * POST /api/users/:id/roles
   */
  createUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = validateCreateUserRole({
        ...req.body,
        userId: id,
      });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Create user role
      const userRole = await RoleService.createUserRole(value);

      // Security audit log
      logger.security('User role created', {
        userId: id,
        role: userRole.role,
        action: 'create_user_role',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json({
        success: true,
        message: 'User role created successfully',
        data: {
          userRole,
        },
      });
    } catch (error: any) {
      logger.error('Create user role failed', error, {
        action: 'create_user_role',
        userId: req.params.id,
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Get user roles
   * GET /api/users/:id/roles
   */
  getUserRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const tenantId = req.query.tenantId as string | undefined;

      const roles = await RoleService.getUserRoles(id, tenantId || null);

      res.status(200).json({
        success: true,
        message: 'User roles retrieved successfully',
        data: {
          roles,
        },
      });
    } catch (error: any) {
      logger.error('Get user roles failed', error, {
        action: 'get_user_roles',
        userId: req.params.id,
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Remove user role
   * DELETE /api/users/:id/roles/:roleId
   */
  removeUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, roleId } = req.params;
      const tenantId = req.query.tenantId as string | undefined;
      const role = req.query.role as string;
      const departmentId = req.query.departmentId as string | undefined;

      if (!role || !tenantId) {
        res.status(400).json({
          success: false,
          message: 'Role and tenantId are required',
        });
        return;
      }

      await RoleService.removeUserRole(id, role, tenantId, departmentId || null);

      // Security audit log
      logger.security('User role removed', {
        userId: id,
        role,
        action: 'remove_user_role',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(200).json({
        success: true,
        message: 'User role removed successfully',
      });
    } catch (error: any) {
      logger.error('Remove user role failed', error, {
        action: 'remove_user_role',
        userId: req.params.id,
      });

      if (error.message === 'User role not found') {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Create permission
   * POST /api/permissions
   */
  createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const { error, value } = validateCreatePermission(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Create permission
      const permission = await PermissionService.createPermission(value);

      // Security audit log
      logger.security('Permission created', {
        permissionId: permission.id,
        permissionCode: permission.code,
        action: 'create_permission',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: {
          permission,
        },
      });
    } catch (error: any) {
      logger.error('Create permission failed', error, {
        action: 'create_permission',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Get all permissions
   * GET /api/permissions
   */
  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const module = req.query.module as string | undefined;

      const permissions = module
        ? await PermissionService.getPermissionsByModule(module)
        : await PermissionService.getAllPermissions();

      res.status(200).json({
        success: true,
        message: 'Permissions retrieved successfully',
        data: {
          permissions,
        },
      });
    } catch (error: any) {
      logger.error('Get permissions failed', error, {
        action: 'get_permissions',
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Assign permission to role
   * POST /api/roles/:role/permissions
   */
  assignRolePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role } = req.params;

      // Validate request body
      const { error, value } = validateAssignRolePermission({
        ...req.body,
        role,
      });
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map((detail) => detail.message),
        });
        return;
      }

      // Assign permission
      const rolePermission = await PermissionService.assignRolePermission(value);

      // Security audit log
      logger.security('Role permission assigned', {
        role,
        permissionId: value.permissionId,
        action: 'assign_role_permission',
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      });

      res.status(201).json({
        success: true,
        message: 'Permission assigned to role successfully',
        data: {
          rolePermission,
        },
      });
    } catch (error: any) {
      logger.error('Assign role permission failed', error, {
        action: 'assign_role_permission',
        role: req.params.role,
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };

  /**
   * Get role permissions
   * GET /api/roles/:role/permissions
   */
  getRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role } = req.params;

      const permissions = await PermissionService.getRolePermissions(role);

      res.status(200).json({
        success: true,
        message: 'Role permissions retrieved successfully',
        data: {
          permissions,
        },
      });
    } catch (error: any) {
      logger.error('Get role permissions failed', error, {
        action: 'get_role_permissions',
        role: req.params.role,
      });

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  };
}

export { UserController };

