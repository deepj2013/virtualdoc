import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/roles/:role/permissions
 * @desc    Assign permission to role
 * @access  Protected
 */
router.post('/:role/permissions', userController.assignRolePermission);

/**
 * @route   GET /api/roles/:role/permissions
 * @desc    Get role permissions
 * @access  Protected
 */
router.get('/:role/permissions', userController.getRolePermissions);

export default router;

