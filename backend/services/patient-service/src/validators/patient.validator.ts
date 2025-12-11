import Joi from 'joi';

export const validateCreatePatient = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).required(),
    lastName: Joi.string().min(2).max(100).required(),
    middleName: Joi.string().min(2).max(100).optional(),
    dateOfBirth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    bloodGroup: Joi.string().optional(),
    heightCm: Joi.number().positive().optional(),
    weightKg: Joi.number().positive().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    email: Joi.string().email().optional(),
    addressLine1: Joi.string().max(255).optional(),
    addressLine2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    postalCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional().default('India'),
    emergencyContactName: Joi.string().max(100).optional(),
    emergencyContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    emergencyContactRelation: Joi.string().max(50).optional(),
    insuranceProvider: Joi.string().max(255).optional(),
    insuranceNumber: Joi.string().max(100).optional(),
    abhaId: Joi.string().max(50).optional(),
    aadharNumber: Joi.string().length(12).pattern(/^\d+$/).optional(),
    panNumber: Joi.string().length(10).pattern(/^[A-Z]{5}\d{4}[A-Z]$/).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validateUpdatePatient = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).optional(),
    lastName: Joi.string().min(2).max(100).optional(),
    middleName: Joi.string().min(2).max(100).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    bloodGroup: Joi.string().optional(),
    heightCm: Joi.number().positive().optional(),
    weightKg: Joi.number().positive().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    email: Joi.string().email().optional(),
    addressLine1: Joi.string().max(255).optional(),
    addressLine2: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    postalCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
    emergencyContactName: Joi.string().max(100).optional(),
    emergencyContactPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    emergencyContactRelation: Joi.string().max(50).optional(),
    insuranceProvider: Joi.string().max(255).optional(),
    insuranceNumber: Joi.string().max(100).optional(),
    abhaId: Joi.string().max(50).optional(),
    aadharNumber: Joi.string().length(12).pattern(/^\d+$/).optional(),
    panNumber: Joi.string().length(10).pattern(/^[A-Z]{5}\d{4}[A-Z]$/).optional(),
    isActive: Joi.boolean().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validatePatientSearch = (data: any) => {
  const schema = Joi.object({
    search: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    bloodGroup: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
  });

  return schema.validate(data, { abortEarly: false });
};

