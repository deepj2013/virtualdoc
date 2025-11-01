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

export default router;

