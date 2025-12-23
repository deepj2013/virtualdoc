import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import PermissionService from '../services/PermissionService';

class PermissionController {
  /**
   * Create a new permission
   * POST /api/permissions
   */
  createPermission = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { name, code, module, description } = req.body;

      if (!name || !code || !module) {
        res.status(400).json({
          success: false,
          message: 'Name, code, and module are required',
        });
        return;
      }

      const permission = await PermissionService.createPermission({
        name,
        code,
        module,
        description,
      });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: {
          permission,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create permission',
      });
    }
  };

  /**
   * Get all permissions
   * GET /api/permissions
   */
  getAllPermissions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { module } = req.query;

      let permissions;
      if (module && typeof module === 'string') {
        permissions = await PermissionService.getPermissionsByModule(module);
      } else {
        permissions = await PermissionService.getAllPermissions();
      }

      res.json({
        success: true,
        data: {
          permissions,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get permissions',
      });
    }
  };
}

export default PermissionController;




