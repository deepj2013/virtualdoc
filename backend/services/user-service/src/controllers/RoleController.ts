import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import PermissionService from '../services/PermissionService';

class RoleController {
  /**
   * Assign permission to role
   * POST /api/roles/:role/permissions
   */
  assignRolePermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { role } = req.params;
      const { permissionId, canRead, canWrite, canDelete, canManage } = req.body;

      if (!permissionId) {
        res.status(400).json({
          success: false,
          message: 'Permission ID is required',
        });
        return;
      }

      const rolePermission = await PermissionService.assignRolePermission({
        role,
        permissionId,
        canRead,
        canWrite,
        canDelete,
        canManage,
      });

      res.json({
        success: true,
        message: 'Permission assigned to role successfully',
        data: {
          rolePermission,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign permission to role',
      });
    }
  };

  /**
   * Get role permissions
   * GET /api/roles/:role/permissions
   */
  getRolePermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { role } = req.params;
      const permissions = await PermissionService.getRolePermissions(role);

      res.json({
        success: true,
        data: {
          role,
          permissions,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get role permissions',
      });
    }
  };
}

export default RoleController;

