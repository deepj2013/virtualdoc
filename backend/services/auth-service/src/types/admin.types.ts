export interface UniversalAdminSignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UniversalAdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  userId: string;
  tenantId: string | null;
  adminRoleId: string | null;
  adminRoleCode: 'universal_admin' | 'sub_admin' | 'tenant_admin';
  assignedTenantId: string | null;
  assignedDepartments: string[] | null;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason: string | null;
  suspendedBy: string | null;
  suspendedAt: Date | null;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  requiresPasswordChange: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  backupCodes: string[] | null;
  assignedBy: string | null;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string | null;
  email: string;
  passwordHash: string | null;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  profilePictureUrl: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthToken {
  id: string;
  userId: string;
  tokenType: 'access_token' | 'refresh_token' | 'api_key' | 'password_reset' | 'email_verification' | '2fa_token';
  tokenHash: string;
  tokenValue: string | null;
  jti: string | null;
  refreshTokenId: string | null;
  deviceId: string | null;
  deviceInfo: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  tenantId: string | null;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  revokedBy: string | null;
  revokedReason: string | null;
  lastUsedAt: Date | null;
  usageCount: number;
  isActive: boolean;
  metadata: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: string;
      adminRoleCode: string | null;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      tokenType: string;
    };
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      adminRoleCode: string;
    };
  };
}

