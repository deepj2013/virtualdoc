import { query } from '../config/database';
import { generateOTP, hashOTP, getOTPExpiration } from '../helpers/otp.helper';

export class PasswordResetService {
  /**
   * Request password reset - generate OTP
   */
  async requestPasswordReset(email: string): Promise<{ otp: string; expiresAt: Date }> {
    // Find user
    const userResult = await query(
      'SELECT id, email FROM users WHERE email = $1 AND tenant_id IS NULL',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = getOTPExpiration();

    // Revoke all existing tokens for this user first
    await query(
      `UPDATE password_reset_tokens 
       SET is_revoked = true 
       WHERE user_id = $1 AND is_used = false`,
      [user.id]
    );

    // Store in password_reset_tokens table
    await query(
      `INSERT INTO password_reset_tokens (
        user_id, token_hash, token_value, email, requested_at, expires_at, is_used, is_revoked
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, false, false)`,
      [user.id, otpHash, otp, email.toLowerCase(), expiresAt]
    );

    return { otp, expiresAt };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, otp: string): Promise<{ tokenId: string; userId: string }> {
    // Get reset token
    const tokenResult = await query(
      `SELECT id, user_id, token_hash, token_value, expires_at, is_used, is_revoked
       FROM password_reset_tokens
       WHERE email = $1 AND is_used = false AND is_revoked = false
       ORDER BY requested_at DESC
       LIMIT 1`,
      [email.toLowerCase()]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid or expired OTP');
    }

    const token = tokenResult.rows[0];

    // Check expiration
    if (new Date(token.expires_at) < new Date()) {
      throw new Error('OTP has expired');
    }

    // Verify OTP - compare directly with stored token_value
    if (token.token_value !== otp) {
      throw new Error('Invalid OTP');
    }

    return {
      tokenId: token.id,
      userId: token.user_id,
    };
  }

  /**
   * Reset password
   */
  async resetPassword(tokenId: string, newPassword: string): Promise<void> {
    const { hashPassword } = await import('../helpers/password.helper');
    const { validatePasswordStrength } = await import('../helpers/password.helper');

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.message);
    }

    // Get token
    const tokenResult = await query(
      'SELECT user_id, is_used FROM password_reset_tokens WHERE id = $1',
      [tokenId]
    );

    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid token');
    }

    const token = tokenResult.rows[0];

    if (token.is_used) {
      throw new Error('Token has already been used');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, token.user_id]
    );

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET is_used = true WHERE id = $1',
      [tokenId]
    );
  }

  /**
   * Revoke all reset tokens for a user
   */
  async revokeAllTokens(userId: string): Promise<void> {
    await query(
      'UPDATE password_reset_tokens SET is_revoked = true WHERE user_id = $1 AND is_used = false',
      [userId]
    );
  }
}

export default new PasswordResetService();

