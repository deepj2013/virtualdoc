import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Protected
 */
router.post('/', userController.createUser);

/**
 * @route   GET /api/users
 * @desc    List users with pagination and filters
 * @access  Protected
 */
router.get('/', userController.listUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Protected
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Protected
 */
router.put('/:id', userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Protected
 */
router.delete('/:id', userController.deleteUser);

/**
 * @route   POST /api/users/:id/roles
 * @desc    Create user role
 * @access  Protected
 */
router.post('/:id/roles', userController.createUserRole);

/**
 * @route   GET /api/users/:id/roles
 * @desc    Get user roles
 * @access  Protected
 */
router.get('/:id/roles', userController.getUserRoles);

/**
 * @route   DELETE /api/users/:id/roles/:roleId
 * @desc    Remove user role
 * @access  Protected
 */
router.delete('/:id/roles/:roleId', userController.removeUserRole);

export default router;

