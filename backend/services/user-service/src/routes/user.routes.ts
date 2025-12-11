import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticate } from '../middleware/auth.middleware';
import { requireOwnershipOrAdmin, requireRole } from '../middleware/rbac.middleware';

const router = Router();
const userController = new UserController();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', authenticate, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Protected
 */
router.put('/profile', authenticate, userController.updateProfile);

/**
 * @route   GET /api/users/preferences
 * @desc    Get user preferences
 * @access  Protected
 */
router.get('/preferences', authenticate, userController.getPreferences);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Protected
 */
router.put('/preferences', authenticate, userController.updatePreferences);

/**
 * @route   GET /api/users/search
 * @desc    Search users (Admin only)
 * @access  Protected, Admin
 */
router.get(
  '/search',
  authenticate,
  requireRole('super_admin', 'admin', 'sub_admin', 'universal_admin'),
  userController.searchUsers
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Protected (own profile or admin)
 */
router.get(
  '/:userId',
  authenticate,
  requireOwnershipOrAdmin,
  userController.getUserById
);

export default router;

