import { Request } from 'express';
import crypto from 'crypto';

/**
 * Get device ID from request (using fingerprint or user agent)
 */
export const getDeviceId = (req: Request): string => {
  const userAgent = req.get('user-agent') || '';
  const ip = req.ip || req.socket.remoteAddress || '';
  return crypto.createHash('sha256').update(`${userAgent}-${ip}`).digest('hex').substring(0, 32);
};

/**
 * Get device information from request
 */
export const getDeviceInfo = (req: Request): string => {
  const userAgent = req.get('user-agent') || 'Unknown';
  const platform = req.get('sec-ch-ua-platform') || 'Unknown';
  return JSON.stringify({
    userAgent,
    platform,
    ip: req.ip || req.socket.remoteAddress,
  });
};

/**
 * Get device type from user agent
 */
export const getDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'api' => {
  if (!userAgent) return 'api';
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  if (ua.includes('api') || ua.includes('postman') || ua.includes('curl')) {
    return 'api';
  }
  return 'desktop';
};

