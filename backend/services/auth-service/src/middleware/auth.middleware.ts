import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helpers/jwt.helper';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    adminRoleCode?: string;
    tenantId?: string | null;
  };
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user info to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);

      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        adminRoleCode: decoded.adminRoleCode,
        tenantId: decoded.tenantId || null,
      };

      next();
    } catch (error: any) {
      if (error.message.includes('expired')) {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
        return;
      }

      res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Require Universal Admin role
 */
export const requireUniversalAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  if (req.user.adminRoleCode !== 'universal_admin' && req.user.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      message: 'Universal Admin access required',
    });
    return;
  }

  next();
};

