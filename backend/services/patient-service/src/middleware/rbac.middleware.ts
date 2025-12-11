import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Role-Based Access Control Middleware
 * Checks if user has required role(s)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role;
    const adminRoleCode = req.user.adminRoleCode;

    // Check if user has one of the allowed roles
    const hasRole = allowedRoles.includes(userRole) || 
                    (adminRoleCode && allowedRoles.includes(adminRoleCode));

    if (!hasRole) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: {
          role: userRole,
          adminRoleCode: adminRoleCode,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Require any of the specified roles (OR logic)
 */
export const requireAnyRole = (...roles: string[]) => {
  return requireRole(...roles);
};

/**
 * Check if user can access tenant data
 */
export const requireTenantAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
    return;
  }

  // Universal admins can access all tenants
  if (req.user.adminRoleCode === 'universal_admin' || req.user.role === 'super_admin') {
    next();
    return;
  }

  // For tenant-specific requests, check tenant_id matches
  const requestedTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;

  if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
    res.status(403).json({
      success: false,
      message: 'Access denied to this tenant',
    });
    return;
  }

  next();
};

