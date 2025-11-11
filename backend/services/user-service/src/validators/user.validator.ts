import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).optional().messages({
    'string.min': 'Password must be at least 8 characters long',
  }),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  firstName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must not exceed 100 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must not exceed 100 characters',
    'any.required': 'Last name is required',
  }),
  middleName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Middle name must be at least 2 characters',
    'string.max': 'Middle name must not exceed 100 characters',
  }),
  dateOfBirth: Joi.date().iso().optional().messages({
    'date.format': 'Date of birth must be a valid ISO date',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  role: Joi.string()
    .valid('super_admin', 'admin', 'sub_admin', 'doctor', 'nurse', 'staff', 'patient', 'lab_technician', 'chemist', 'receptionist')
    .required()
    .messages({
      'any.only': 'Role must be one of: super_admin, admin, sub_admin, doctor, nurse, staff, patient, lab_technician, chemist, receptionist',
      'any.required': 'Role is required',
    }),
  tenantId: Joi.string().uuid().allow(null).optional(),
  departmentId: Joi.string().uuid().optional(),
});

export const updateUserSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  firstName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must not exceed 100 characters',
  }),
  lastName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must not exceed 100 characters',
  }),
  middleName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Middle name must be at least 2 characters',
    'string.max': 'Middle name must not exceed 100 characters',
  }),
  dateOfBirth: Joi.date().iso().optional().messages({
    'date.format': 'Date of birth must be a valid ISO date',
  }),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
  profilePictureUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Profile picture URL must be a valid URI',
  }),
  isActive: Joi.boolean().optional(),
});

export const createUserRoleSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'any.required': 'User ID is required',
    'string.guid': 'User ID must be a valid UUID',
  }),
  role: Joi.string()
    .valid('super_admin', 'admin', 'sub_admin', 'doctor', 'nurse', 'staff', 'patient', 'lab_technician', 'chemist', 'receptionist')
    .required()
    .messages({
      'any.only': 'Role must be one of: super_admin, admin, sub_admin, doctor, nurse, staff, patient, lab_technician, chemist, receptionist',
      'any.required': 'Role is required',
    }),
  tenantId: Joi.string().uuid().required().messages({
    'any.required': 'Tenant ID is required',
    'string.guid': 'Tenant ID must be a valid UUID',
  }),
  departmentId: Joi.string().uuid().allow(null).optional(),
  assignedBy: Joi.string().uuid().required().messages({
    'any.required': 'Assigned by user ID is required',
    'string.guid': 'Assigned by user ID must be a valid UUID',
  }),
});

export const createPermissionSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Permission name must be at least 3 characters',
    'string.max': 'Permission name must not exceed 100 characters',
    'any.required': 'Permission name is required',
  }),
  code: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Permission code must be at least 3 characters',
    'string.max': 'Permission code must not exceed 100 characters',
    'any.required': 'Permission code is required',
  }),
  module: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Module name must be at least 2 characters',
    'string.max': 'Module name must not exceed 100 characters',
    'any.required': 'Module is required',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
});

export const assignRolePermissionSchema = Joi.object({
  role: Joi.string()
    .valid('super_admin', 'admin', 'sub_admin', 'doctor', 'nurse', 'staff', 'patient', 'lab_technician', 'chemist', 'receptionist')
    .required()
    .messages({
      'any.only': 'Role must be one of: super_admin, admin, sub_admin, doctor, nurse, staff, patient, lab_technician, chemist, receptionist',
      'any.required': 'Role is required',
    }),
  permissionId: Joi.string().uuid().required().messages({
    'any.required': 'Permission ID is required',
    'string.guid': 'Permission ID must be a valid UUID',
  }),
  canRead: Joi.boolean().optional(),
  canWrite: Joi.boolean().optional(),
  canDelete: Joi.boolean().optional(),
  canManage: Joi.boolean().optional(),
});

export const validateCreateUser = (data: any) => {
  return createUserSchema.validate(data, { abortEarly: false });
};

export const validateUpdateUser = (data: any) => {
  return updateUserSchema.validate(data, { abortEarly: false });
};

export const validateCreateUserRole = (data: any) => {
  return createUserRoleSchema.validate(data, { abortEarly: false });
};

export const validateCreatePermission = (data: any) => {
  return createPermissionSchema.validate(data, { abortEarly: false });
};

export const validateAssignRolePermission = (data: any) => {
  return assignRolePermissionSchema.validate(data, { abortEarly: false });
};

