import { query } from '../config/database';

export class LoginAttemptService {
  /**
   * Record login attempt
   */
  async recordAttempt(data: {
    userId?: string;
    email: string;
    tenantId?: string | null;
    ipAddress: string;
    userAgent: string;
    attemptType: 'password' | 'oauth' | 'api_key' | '2fa';
    success: boolean;
    failureReason?: string;
    deviceFingerprint?: string;
    sessionId?: string;
  }): Promise<void> {
    await query(
      `INSERT INTO login_attempts (
        user_id, email, tenant_id, ip_address, user_agent,
        attempt_type, success, failure_reason, device_fingerprint,
        session_id, attempted_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        data.userId || null,
        data.email.toLowerCase(),
        data.tenantId || null,
        data.ipAddress,
        data.userAgent,
        data.attemptType,
        data.success,
        data.failureReason || null,
        data.deviceFingerprint || null,
        data.sessionId || null,
      ]
    );
  }

  /**
   * Get failed login attempts count in last X minutes
   */
  async getFailedAttemptsCount(email: string, minutes: number = 15): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE email = $1 
       AND success = false 
       AND attempted_at > NOW() - INTERVAL '${minutes} minutes'`,
      [email.toLowerCase()]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if account should be locked
   */
  async shouldLockAccount(email: string, maxAttempts: number = 5): Promise<boolean> {
    const failedCount = await this.getFailedAttemptsCount(email, 15);
    return failedCount >= maxAttempts;
  }
}

export default new LoginAttemptService();

