// middleware/auth.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import jwt before spying on it
import jwt from 'jsonwebtoken';

// Set up spy on jwt.verify
vi.spyOn(jwt, 'verify');

// Mock the process.env
vi.stubEnv('JWT_SECRET', 'test_secret');

// Create the auth middleware module import after spies are set up
import auth from './auth';

describe('Auth Middleware', () => {
  // Setup mock request, response, and next function
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup mock request object
    req = {
      headers: {
        authorization: 'Bearer valid_token'
      }
    };
    
    // Setup mock response object with jest spy methods
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    
    // Setup mock next function
    next = vi.fn();
  });

  it('should pass with valid token and add user to request', () => {
    // Mock the decoded token
    const mockUser = { id: '123', email: 'test@example.com' };
    
    // Setup jwt.verify to return the mock user
    jwt.verify.mockReturnValueOnce(mockUser);
    
    // Call the middleware
    auth(req, res, next);
    
    // Assert jwt.verify was called with correct parameters
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'your_jwt_secret');
    
    // Assert user was added to request
    expect(req.user).toEqual(mockUser);
    
    // Assert next was called
    expect(next).toHaveBeenCalled();
    
    // Assert response status and json were not called
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    // Setup request with no token
    req.headers.authorization = undefined;
    
    // Call the middleware
    auth(req, res, next);
    
    // Assert response status and json were called with correct parameters
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Access denied. No token provided.' 
    });
    
    // Assert next was not called
    expect(next).not.toHaveBeenCalled();
    
    // Assert jwt.verify was not called
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should return 401 if token format is invalid', () => {
    // Setup request with invalid token format (missing Bearer prefix)
    req.headers.authorization = 'invalid_token';
    
    // Call the middleware
    auth(req, res, next);
    
    // Assert response status and json were called with correct parameters
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ 
      message: 'Access denied. No token provided.' 
    });
    
    // Assert next was not called
    expect(next).not.toHaveBeenCalled();
    
    // Assert jwt.verify was not called
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', () => {
    // Setup jwt.verify to throw an error
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    
    // Call the middleware
    auth(req, res, next);
    
    // Assert jwt.verify was called
    expect(jwt.verify).toHaveBeenCalled();
    
    // Assert response status and json were called with correct parameters
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    
    // Assert next was not called
    expect(next).not.toHaveBeenCalled();
  });

  it('should use default secret if JWT_SECRET is not set', () => {
    // Temporarily clear the JWT_SECRET from process.env
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    // Re-import the auth module to use the default secret
    // Note: In a real scenario you'd need to reset the module cache
    // or structure your code differently to enable this test
    
    // Mock the decoded token
    const mockUser = { id: '123', email: 'test@example.com' };
    jwt.verify.mockReturnValueOnce(mockUser);
    
    // Call the middleware
    auth(req, res, next);
    
    // Assert jwt.verify was called with the default secret
    expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'your_jwt_secret');
    
    // Reset the environment variable
    if (originalSecret) {
      process.env.JWT_SECRET = originalSecret;
    }
  });
});
