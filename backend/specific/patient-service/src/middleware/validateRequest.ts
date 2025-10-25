import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          details: errorDetails
        });
        return;
      }

      req.body = value;
      next();
    } catch (err) {
      logger.error('Validation middleware error:', err);
      res.status(500).json({
        success: false,
        message: 'Validation error',
        error: 'VALIDATION_MIDDLEWARE_ERROR'
      });
    }
  };
};



