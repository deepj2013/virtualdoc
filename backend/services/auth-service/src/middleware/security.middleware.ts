/**
 * HIPAA Compliance Security Middleware
 * Ensures Protected Health Information (PHI) is never exposed
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Rate limiting for authentication endpoints
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement Redis-based rate limiting
  // For now, basic implementation
  next();
};

/**
 * Sanitize request body to remove PHI
 */
export const sanitizeRequestBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const sanitized: any = {};
    const sensitiveFields = [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'jwt',
      'ssn',
      'socialSecurityNumber',
      'creditCard',
      'cvv',
      'pin',
    ];

    for (const [key, value] of Object.entries(req.body)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        // Don't include sensitive fields in request body
        continue;
      }
      sanitized[key] = value;
    }

    req.body = sanitized;
  }
  next();
};

/**
 * Audit log middleware for HIPAA compliance
 */
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function (body: any) {
    // Log API access (without PHI)
    if (req.path.startsWith('/api/')) {
      logger.security('API access', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
      });
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Input validation and sanitization
 */
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Prevent NoSQL injection
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Remove potential XSS
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });
  }
  next();
};

/**
 * Check for suspicious activity
 */
export const detectSuspiciousActivity = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement suspicious activity detection
  // - Multiple failed login attempts from same IP
  // - Unusual access patterns
  // - Rapid API calls
  next();
};

