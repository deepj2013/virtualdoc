import Joi from 'joi';

export const validateUpdateProfile = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(100).optional(),
    lastName: Joi.string().min(2).max(100).optional(),
    middleName: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    profilePictureUrl: Joi.string().uri().optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validateUpdatePreferences = (data: any) => {
  const schema = Joi.object({
    language: Joi.string().min(2).max(10).optional(),
    timezone: Joi.string().optional(),
    dateFormat: Joi.string().optional(),
    timeFormat: Joi.string().valid('12h', '24h').optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional(),
    }).optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

export const validateUserSearch = (data: any) => {
  const schema = Joi.object({
    search: Joi.string().optional(),
    role: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    tenantId: Joi.string().uuid().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(20),
  });

  return schema.validate(data, { abortEarly: false });
};

