import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { AuthConfig, RateLimitConfig, SDDError, ErrorCodes } from '../contracts/index.js';

// Security configuration from environment
export const authConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  tokenExpiry: process.env.TOKEN_EXPIRY || '1h',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  apiKeyHeader: 'x-api-key'
};

// Rate limiting configuration
export const createRateLimiter = (config?: Partial<RateLimitConfig>) => {
  const defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests, please try again later',
    ...config
  };

  return rateLimit({
    windowMs: defaultConfig.windowMs,
    max: defaultConfig.maxRequests,
    message: defaultConfig.message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new SDDError(
        defaultConfig.message,
        ErrorCodes.RATE_LIMIT_ERROR,
        429
      );
    }
  });
};

// JWT generation
export const generateToken = (userId: string, permissions: string[] = []) => {
  return jwt.sign(
    { userId, permissions },
    authConfig.jwtSecret,
    { expiresIn: authConfig.tokenExpiry }
  );
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const apiKey = req.headers[authConfig.apiKeyHeader] as string;
    
    // Check for JWT token first
    if (token) {
      try {
        const decoded = jwt.verify(token, authConfig.jwtSecret) as any;
        (req as any).user = {
          userId: decoded.userId,
          permissions: decoded.permissions || []
        };
        return next();
      } catch (error) {
        throw new SDDError('Invalid token', ErrorCodes.AUTH_ERROR, 401);
      }
    }
    
    // Temporary: Allow legacy API key during migration
    if (apiKey && apiKey === process.env.LEGACY_API_KEY) {
      (req as any).user = {
        userId: 'legacy-user',
        permissions: ['*']
      };
      return next();
    }
    
    throw new SDDError('Authentication required', ErrorCodes.AUTH_ERROR, 401);
  } catch (error) {
    if (error instanceof SDDError) {
      return res.status(error.statusCode).json({
        error: error.code,
        message: error.message
      });
    }
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Authentication failed'
    });
  }
};

// Permission check middleware
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        error: ErrorCodes.AUTH_ERROR,
        message: 'Not authenticated'
      });
    }
    
    if (!user.permissions.includes(permission) && !user.permissions.includes('*')) {
      return res.status(403).json({
        error: ErrorCodes.AUTH_ERROR,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Different rate limiters for different endpoints
export const rateLimiters = {
  default: createRateLimiter(),
  strict: createRateLimiter({ maxRequests: 10, windowMs: 15 * 60 * 1000 }),
  auth: createRateLimiter({ maxRequests: 5, windowMs: 15 * 60 * 1000 })
};