import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  adminRoleCode?: string;
  tenantId?: string | null;
  type: 'access' | 'refresh';
}

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN as string,
      issuer: 'virtualdoc-auth-service',
      audience: 'virtualdoc-platform',
    } as jwt.SignOptions
  );
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'type'>): string => {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN as string,
      issuer: 'virtualdoc-auth-service',
      audience: 'virtualdoc-platform',
    } as jwt.SignOptions
  );
};

/**
 * Verify JWT Token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'virtualdoc-auth-service',
      audience: 'virtualdoc-platform',
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate JWT ID (JTI) for token tracking
 */
export const generateJTI = (): string => {
  return randomUUID();
};

/**
 * Hash token for storage (using SHA-256)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Get token expiration timestamp
 */
export const getTokenExpiration = (expiresIn: string): Date => {
  const now = new Date();
  const [value, unit] = expiresIn.match(/(\d+)([smhd])/) || ['1', 'h'];
  const multiplier: { [key: string]: number } = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + parseInt(value) * (multiplier[unit] || multiplier.h));
};

