export interface User {
  id: string;
  tenantId: string | null;
  email: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  tenantId: string | null;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirth: Date | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  profilePictureUrl: string | null;
  role: string;
  isActive: boolean;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profilePictureUrl?: string;
}

export interface UserPreferences {
  userId: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserPreferencesDto {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  theme?: 'light' | 'dark' | 'auto';
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface UserSearchParams {
  search?: string;
  role?: string;
  isActive?: boolean;
  tenantId?: string;
  page?: number;
  limit?: number;
}

