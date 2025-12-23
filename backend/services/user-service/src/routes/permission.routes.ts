import { Router } from 'express';
import PermissionController from '../controllers/PermissionController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const permissionController = new PermissionController();

/**
 * @route   POST /api/permissions
 * @desc    Create a new permission
 * @access  Protected
 */
router.post('/', authenticate, permissionController.createPermission);

/**
 * @route   GET /api/permissions
 * @desc    Get all permissions (optionally filter by module)
 * @access  Protected
 */
router.get('/', authenticate, permissionController.getAllPermissions);

export default router;

