import { query } from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  generateJTI,
  hashToken,
  getTokenExpiration,
} from '../helpers/jwt.helper';
import { AuthToken } from '../types/admin.types';

export class TokenService {
  /**
   * Create access and refresh tokens
   */
  async createTokenPair(data: {
    userId: string;
    email: string;
    role: string;
    adminRoleCode?: string;
    tenantId?: string | null;
    deviceId: string;
    deviceInfo: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<{ accessToken: string; refreshToken: string; accessTokenRecord: AuthToken; refreshTokenRecord: AuthToken }> {
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: data.userId,
      email: data.email,
      role: data.role,
      adminRoleCode: data.adminRoleCode,
      tenantId: data.tenantId,
    });

    const refreshToken = generateRefreshToken({
      userId: data.userId,
      email: data.email,
      role: data.role,
      adminRoleCode: data.adminRoleCode,
      tenantId: data.tenantId,
    });

    // Generate JTIs
    const accessJTI = generateJTI();
    const refreshJTI = generateJTI();

    // Hash tokens for storage
    const accessTokenHash = hashToken(accessToken);
    const refreshTokenHash = hashToken(refreshToken);

    // Get expiration times
    const accessExpiresAt = getTokenExpiration(process.env.JWT_EXPIRES_IN || '1h');
    const refreshExpiresAt = getTokenExpiration(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');

    // Create refresh token first
    const refreshResult = await query(
      `INSERT INTO authentication_tokens (
        user_id, token_type, token_hash, jti, device_id, device_info,
        ip_address, user_agent, tenant_id, issued_at, expires_at,
        usage_count, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        data.userId,
        'refresh_token',
        refreshTokenHash,
        refreshJTI,
        data.deviceId,
        data.deviceInfo,
        data.ipAddress,
        data.userAgent,
        data.tenantId || null,
        refreshExpiresAt,
      ]
    );

    const refreshTokenRecord = refreshResult.rows[0] as AuthToken;

    // Create access token with reference to refresh token
    const accessResult = await query(
      `INSERT INTO authentication_tokens (
        user_id, token_type, token_hash, jti, refresh_token_id,
        device_id, device_info, ip_address, user_agent, tenant_id,
        issued_at, expires_at, usage_count, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11, 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        data.userId,
        'access_token',
        accessTokenHash,
        accessJTI,
        refreshTokenRecord.id,
        data.deviceId,
        data.deviceInfo,
        data.ipAddress,
        data.userAgent,
        data.tenantId || null,
        accessExpiresAt,
      ]
    );

    const accessTokenRecord = accessResult.rows[0] as AuthToken;

    return {
      accessToken,
      refreshToken,
      accessTokenRecord,
      refreshTokenRecord,
    };
  }

  /**
   * Revoke token
   */
  async revokeToken(tokenHash: string, revokedBy?: string, reason?: string): Promise<void> {
    await query(
      `UPDATE authentication_tokens 
       SET revoked_at = CURRENT_TIMESTAMP, revoked_by = $1, revoked_reason = $2, is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE token_hash = $3 AND is_active = true`,
      [revokedBy || null, reason || null, tokenHash]
    );
  }

  /**
   * Revoke all user tokens
   */
  async revokeAllUserTokens(userId: string, revokedBy?: string, reason?: string): Promise<void> {
    await query(
      `UPDATE authentication_tokens 
       SET revoked_at = CURRENT_TIMESTAMP, revoked_by = $1, revoked_reason = $2, is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND is_active = true`,
      [revokedBy || null, reason || 'User logout', userId]
    );
  }

  /**
   * Update token last used timestamp
   */
  async updateTokenUsage(tokenHash: string): Promise<void> {
    await query(
      `UPDATE authentication_tokens 
       SET last_used_at = CURRENT_TIMESTAMP, usage_count = usage_count + 1, updated_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  /**
   * Find token by hash
   */
  async findByHash(tokenHash: string): Promise<AuthToken | null> {
    const result = await query(
      'SELECT * FROM authentication_tokens WHERE token_hash = $1 AND is_active = true',
      [tokenHash]
    );
    return result.rows[0] as AuthToken || null;
  }
}

export default new TokenService();

