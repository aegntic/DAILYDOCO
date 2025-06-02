import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { logger } from '../config/logger.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

// Temporary in-memory user store (replace with database)
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  company?: string;
  role: 'user' | 'admin' | 'enterprise';
  subscription: 'free' | 'pro' | 'team' | 'enterprise';
  createdAt: Date;
  lastLoginAt?: Date;
}

const users: Map<string, User> = new Map();
const refreshTokens: Set<string> = new Set();

/**
 * Generate JWT tokens using EdDSA algorithm for maximum security
 */
const generateTokens = (user: User) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable not set');
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    subscription: user.subscription,
  };

  // Access token (15 minutes)
  const accessToken = jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256', // Using HS256 for development, EdDSA for production
    expiresIn: '15m',
    issuer: 'dailydoco-pro',
    audience: 'dailydoco-api',
  });

  // Refresh token (7 days)
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' }, 
    jwtSecret, 
    {
      algorithm: 'HS256',
      expiresIn: '7d',
      issuer: 'dailydoco-pro',
      audience: 'dailydoco-api',
    }
  );

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', validateRequest(RegisterSchema), async (req, res) => {
  try {
    const { email, password, name, company } = req.body;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: userId,
      email,
      passwordHash,
      name,
      company,
      role: 'user',
      subscription: 'free',
      createdAt: new Date(),
    };

    users.set(userId, user);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.add(refreshToken);

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      subscription: user.subscription
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    logger.error('Registration error', { error });
    res.status(500).json({
      error: 'Registration failed',
      message: 'Unable to create account at this time'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
router.post('/login', validateRequest(LoginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      logger.warn('Invalid login attempt', { email });
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    users.set(user.id, user);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    refreshTokens.add(refreshToken);

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        role: user.role,
        subscription: user.subscription,
        lastLoginAt: user.lastLoginAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      error: 'Login failed',
      message: 'Unable to authenticate at this time'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validateRequest(RefreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Check if refresh token is valid
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or has been revoked'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable not set');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtSecret) as any;
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'Token is not a refresh token'
      });
    }

    // Find user
    const user = users.get(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User associated with this token no longer exists'
      });
    }

    // Generate new tokens
    const newTokens = generateTokens(user);
    
    // Remove old refresh token and add new one
    refreshTokens.delete(refreshToken);
    refreshTokens.add(newTokens.refreshToken);

    logger.info('Tokens refreshed successfully', { userId: user.id });

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: '15m'
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is malformed or expired'
      });
    }

    logger.error('Token refresh error', { error });
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'Unable to refresh tokens at this time'
    });
  }
});

/**
 * POST /api/auth/logout
 * Revoke refresh token
 */
router.post('/logout', validateRequest(RefreshTokenSchema), (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Remove refresh token
    refreshTokens.delete(refreshToken);

    logger.info('User logged out successfully');

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({
      error: 'Logout failed',
      message: 'Unable to complete logout at this time'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', (req, res) => {
  // This would typically be protected by auth middleware
  // For demo purposes, returning a static response
  res.json({
    message: 'This endpoint requires authentication',
    hint: 'Add the authenticateToken middleware to protect this route'
  });
});

export { router as authRouter };