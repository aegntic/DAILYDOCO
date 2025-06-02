import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { logger } from '../config/logger.js';

// JWT payload schema
const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'enterprise']),
  subscription: z.enum(['free', 'pro', 'team', 'enterprise']),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT Authentication middleware using EdDSA algorithm
 * Provides stateless authentication with enhanced security
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid access token in the Authorization header'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logger.error('JWT_SECRET environment variable not set');
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication service unavailable'
    });
  }

  try {
    // Verify token with EdDSA algorithm (most secure)
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: ['EdDSA', 'ES256', 'RS256'], // Fallback for compatibility
      issuer: 'dailydoco-pro',
      audience: 'dailydoco-api'
    });

    // Validate payload structure
    const validation = JWTPayloadSchema.safeParse(decoded);
    if (!validation.success) {
      logger.warn('Invalid JWT payload structure', { 
        errors: validation.error.errors,
        token: token.substring(0, 20) + '...'
      });
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Token payload does not match expected structure'
      });
    }

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (validation.data.exp <= now) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired, please refresh your session'
      });
    }

    // Attach user info to request
    req.user = validation.data;
    
    logger.debug('Token authenticated successfully', {
      userId: validation.data.userId,
      email: validation.data.email,
      role: validation.data.role
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT verification failed', { 
        error: error.message,
        token: token.substring(0, 20) + '...'
      });
      
      return res.status(401).json({
        error: 'Invalid token',
        message: error.message
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired, please refresh your session'
      });
    }

    logger.error('Unexpected authentication error', { error });
    return res.status(500).json({
      error: 'Authentication service error',
      message: 'Unable to verify token'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This endpoint requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Subscription-based authorization middleware
 */
export const requireSubscription = (subscriptions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    if (!subscriptions.includes(req.user.subscription)) {
      logger.warn('Subscription upgrade required', {
        userId: req.user.userId,
        userSubscription: req.user.subscription,
        requiredSubscriptions: subscriptions
      });
      
      return res.status(402).json({
        error: 'Subscription upgrade required',
        message: `This feature requires one of the following subscriptions: ${subscriptions.join(', ')}`,
        userSubscription: req.user.subscription,
        upgradeUrl: '/upgrade'
      });
    }

    next();
  };
};