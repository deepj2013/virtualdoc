import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, requireUniversalAdmin } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

// Auth routes (public)
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
router.post('/logout', authenticate, adminController.logout);

// Admin Management routes (protected, universal admin only)
// Note: These routes are mounted at both /api/admin/auth and /api/admin
/**
 * @route   GET /api/admin/admins
 * @desc    List all admins
 * @access  Protected, Universal Admin
 */
router.get('/admins', authenticate, requireUniversalAdmin, adminController.listAdmins);

/**
 * @route   POST /api/admin/admins
 * @desc    Create new admin
 * @access  Protected, Universal Admin
 */
router.post('/admins', authenticate, requireUniversalAdmin, adminController.createAdmin);

/**
 * @route   PUT /api/admin/admins/:id
 * @desc    Update admin
 * @access  Protected, Universal Admin
 */
router.put('/admins/:id', authenticate, requireUniversalAdmin, adminController.updateAdmin);

// Tenant Management routes (protected, universal admin only)
/**
 * @route   GET /api/admin/tenants
 * @desc    List all tenants
 * @access  Protected, Universal Admin
 */
router.get('/tenants', authenticate, requireUniversalAdmin, adminController.listTenants);

/**
 * @route   POST /api/admin/tenants
 * @desc    Create new tenant
 * @access  Protected, Universal Admin
 */
router.post('/tenants', authenticate, requireUniversalAdmin, adminController.createTenant);

/**
 * @route   PUT /api/admin/tenants/:id
 * @desc    Update tenant
 * @access  Protected, Universal Admin
 */
router.put('/tenants/:id', authenticate, requireUniversalAdmin, adminController.updateTenant);

// Dashboard & Analytics routes (protected, universal admin only)
/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Protected, Universal Admin
 */
router.get('/dashboard/stats', authenticate, requireUniversalAdmin, adminController.getDashboardStats);

/**
 * @route   GET /api/admin/analytics
 * @desc    Get analytics data
 * @access  Protected, Universal Admin
 */
router.get('/analytics', authenticate, requireUniversalAdmin, adminController.getAnalytics);

/**
 * @route   GET /api/admin/billing
 * @desc    Get billing information
 * @access  Protected, Universal Admin
 */
router.get('/billing', authenticate, requireUniversalAdmin, adminController.getBilling);

/**
 * @route   GET /api/admin/security
 * @desc    Get security information
 * @access  Protected, Universal Admin
 */
router.get('/security', authenticate, requireUniversalAdmin, adminController.getSecurity);

/**
 * @route   GET /api/admin/logs
 * @desc    Get audit logs
 * @access  Protected, Universal Admin
 */
router.get('/logs', authenticate, requireUniversalAdmin, adminController.getAuditLogs);

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Protected, Universal Admin
 */
router.get('/settings', authenticate, requireUniversalAdmin, adminController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @access  Protected, Universal Admin
 */
router.put('/settings', authenticate, requireUniversalAdmin, adminController.updateSettings);

export default router;

