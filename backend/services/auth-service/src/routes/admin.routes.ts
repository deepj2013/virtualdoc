import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const adminController = new AdminController();

/**
 * @route   POST /api/admin/auth/signup
 * @desc    Create Universal Admin account
 * @access  Public
 */
router.post('/signup', adminController.signup);

/**
 * @route   POST /api/admin/auth/login
 * @desc    Universal Admin login
 * @access  Public
 */
router.post('/login', adminController.login);

/**
 * @route   POST /api/admin/auth/forgot-password
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post('/forgot-password', adminController.forgotPassword);

/**
 * @route   POST /api/admin/auth/reset-password
 * @desc    Reset password with OTP
 * @access  Public
 */
router.post('/reset-password', adminController.resetPassword);

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Logout and revoke tokens
 * @access  Protected
 */
router.post('/logout', adminController.logout);

export default router;

