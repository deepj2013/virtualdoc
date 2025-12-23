import { Router } from 'express';
import RoleController from '../controllers/RoleController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const roleController = new RoleController();

/**
 * @route   POST /api/roles/:role/permissions
 * @desc    Assign permission to role
 * @access  Protected
 */
router.post('/:role/permissions', authenticate, roleController.assignRolePermission);

/**
 * @route   GET /api/roles/:role/permissions
 * @desc    Get role permissions
 * @access  Protected
 */
router.get('/:role/permissions', authenticate, roleController.getRolePermissions);

export default router;

