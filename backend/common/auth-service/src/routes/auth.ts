import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validateRequest';
import { authSchemas } from '../schemas/authSchemas';
import { authenticateToken } from '../middleware/authenticateToken';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  validateRequest(authSchemas.register),
  authController.register
);

router.post('/login', 
  validateRequest(authSchemas.login),
  authController.login
);

router.post('/forgot-password',
  validateRequest(authSchemas.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password',
  validateRequest(authSchemas.resetPassword),
  authController.resetPassword
);

router.post('/verify-email',
  validateRequest(authSchemas.verifyEmail),
  authController.verifyEmail
);

// Protected routes
router.post('/logout',
  authenticateToken,
  authController.logout
);

router.post('/refresh-token',
  validateRequest(authSchemas.refreshToken),
  authController.refreshToken
);

router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

router.put('/change-password',
  authenticateToken,
  validateRequest(authSchemas.changePassword),
  authController.changePassword
);

export { router as authRoutes };
