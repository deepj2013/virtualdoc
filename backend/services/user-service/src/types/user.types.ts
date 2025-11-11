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

export interface CreateUserRequest {
  email: string;
  password?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  role: string;
  tenantId?: string | null;
  departmentId?: string;
}

export interface UpdateUserRequest {
  phone?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profilePictureUrl?: string;
  isActive?: boolean;
}

export interface UserRole {
  id: string;
  userId: string;
  role: string;
  tenantId: string;
  departmentId: string | null;
  assignedBy: string | null;
  assignedAt: Date;
  isActive: boolean;
}

export interface CreateUserRoleRequest {
  userId: string;
  role: string;
  tenantId: string;
  departmentId?: string | null;
  assignedBy: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description: string | null;
  createdAt: Date;
}

export interface RolePermission {
  id: string;
  role: string;
  permissionId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManage: boolean;
  createdAt: Date;
}

export interface CreatePermissionRequest {
  name: string;
  code: string;
  module: string;
  description?: string;
}

export interface AssignRolePermissionRequest {
  role: string;
  permissionId: string;
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
  canManage?: boolean;
}

export interface UserResponse {
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
  gender: string | null;
  profilePictureUrl: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data: {
    users: UserResponse[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
    roles: UserRole[];
  };
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
  };
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
  };
}

