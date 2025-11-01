/**
 * OTP Generation and Validation Helper
 * For password reset functionality
 */

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for storage
 */
export const hashOTP = async (otp: string): Promise<string> => {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP
 */
export const verifyOTP = async (otp: string, hashedOTP: string): Promise<boolean> => {
  const crypto = await import('crypto');
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return hash === hashedOTP;
};

/**
 * OTP expiration time (10 minutes)
 */
export const getOTPExpiration = (): Date => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

