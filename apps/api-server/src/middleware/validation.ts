import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { logger } from '../config/logger.js';

/**
 * Validation middleware factory using Zod schemas
 * Provides comprehensive request validation with detailed error messages
 */
export const validateRequest = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validation = schema.safeParse(req.body);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input
        }));

        logger.warn('Request validation failed', {
          path: req.path,
          method: req.method,
          errors,
          body: req.body
        });

        return res.status(400).json({
          error: 'Validation failed',
          message: 'Request body contains invalid data',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      // Replace request body with validated data
      req.body = validation.data;
      next();

    } catch (error) {
      logger.error('Validation middleware error', { error, path: req.path });
      
      res.status(500).json({
        error: 'Validation service error',
        message: 'Unable to validate request data'
      });
    }
  };
};

/**
 * Query parameter validation middleware
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse(req.query);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input
        }));

        return res.status(400).json({
          error: 'Query validation failed',
          message: 'Query parameters contain invalid data',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      req.query = validation.data as any;
      next();

    } catch (error) {
      logger.error('Query validation middleware error', { error, path: req.path });
      
      res.status(500).json({
        error: 'Query validation service error',
        message: 'Unable to validate query parameters'
      });
    }
  };
};

/**
 * Path parameter validation middleware
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse(req.params);
      
      if (!validation.success) {
        const errors = validation.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
          received: err.input
        }));

        return res.status(400).json({
          error: 'Parameter validation failed',
          message: 'URL parameters contain invalid data',
          details: errors,
          timestamp: new Date().toISOString()
        });
      }

      req.params = validation.data as any;
      next();

    } catch (error) {
      logger.error('Parameter validation middleware error', { error, path: req.path });
      
      res.status(500).json({
        error: 'Parameter validation service error',
        message: 'Unable to validate URL parameters'
      });
    }
  };
};