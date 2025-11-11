import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/permissions
 * @desc    Create a new permission
 * @access  Protected
 */
router.post('/', userController.createPermission);

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions (optionally filter by module)
 * @access  Protected
 */
router.get('/', userController.getAllPermissions);

export default router;

