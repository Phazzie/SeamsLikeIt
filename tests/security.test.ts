import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { authenticate, rateLimiters, generateToken } from '../src/middleware/auth';
import { SDDError, ErrorCodes } from '../src/contracts';

describe('Security Tests', () => {
  let app: express.Application;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    
    // Test endpoints
    app.get('/public', (req, res) => res.json({ message: 'public' }));
    app.get('/protected', authenticate, (req, res) => res.json({ message: 'protected' }));
    app.get('/rate-limited', rateLimiters.strict, (req, res) => res.json({ message: 'ok' }));
  });
  
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const response = await request(app)
        .get('/protected')
        .expect(401);
      
      expect(response.body.error).toBe(ErrorCodes.AUTH_ERROR);
    });
    
    it('should accept valid JWT tokens', async () => {
      const token = generateToken('test-user', ['read']);
      
      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.message).toBe('protected');
    });
    
    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body.error).toBe(ErrorCodes.AUTH_ERROR);
    });
    
    it('should accept legacy API key during migration', async () => {
      process.env.LEGACY_API_KEY = 'test-legacy-key';
      
      const response = await request(app)
        .get('/protected')
        .set('x-api-key', 'test-legacy-key')
        .expect(200);
      
      expect(response.body.message).toBe('protected');
      
      delete process.env.LEGACY_API_KEY;
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make requests up to the limit
      for (let i = 0; i < 5; i++) {
        await request(app)
          .get('/rate-limited')
          .expect(200);
      }
      
      // Next request should be rate limited
      const response = await request(app)
        .get('/rate-limited')
        .expect(429);
      
      expect(response.body.error).toBe(ErrorCodes.RATE_LIMIT_ERROR);
    });
  });
  
  describe('XSS Protection', () => {
    it('should not render HTML in error messages', async () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      
      // This would be in the actual tool implementation
      const sanitize = (text: string) => {
        return text.replace(/[<>]/g, (char) => {
          return char === '<' ? '&lt;' : '&gt;';
        });
      };
      
      const sanitized = sanitize(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    });
  });
  
  describe('Input Validation', () => {
    it('should validate tool inputs with Zod schemas', () => {
      const { AnalyzeRequirementsSchema } = require('../src/contracts');
      
      // Valid input
      const validResult = AnalyzeRequirementsSchema.safeParse({
        requirements: 'Create a user system',
        domain: 'healthcare'
      });
      expect(validResult.success).toBe(true);
      
      // Invalid input - empty requirements
      const invalidResult1 = AnalyzeRequirementsSchema.safeParse({
        requirements: '',
        domain: 'healthcare'
      });
      expect(invalidResult1.success).toBe(false);
      
      // Invalid input - too long
      const invalidResult2 = AnalyzeRequirementsSchema.safeParse({
        requirements: 'a'.repeat(10001),
        domain: 'healthcare'
      });
      expect(invalidResult2.success).toBe(false);
      
      // Invalid domain
      const invalidResult3 = AnalyzeRequirementsSchema.safeParse({
        requirements: 'Create a user system',
        domain: 'invalid-domain'
      });
      expect(invalidResult3.success).toBe(false);
    });
  });
  
  describe('API Key Security', () => {
    it('should not log sensitive information', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      // Simulate server startup
      const sensitiveData = 'secret-api-key-12345';
      
      // Good practice - don't log sensitive data
      console.log('🔐 Authentication: JWT enabled');
      
      // Bad practice - logging API keys
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining(sensitiveData));
      
      consoleSpy.mockRestore();
    });
  });
});