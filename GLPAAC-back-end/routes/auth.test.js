import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Create an express app
const app = express();
app.use(express.json());

// Mock the database pool
vi.mock('../db/config', () => ({
  pool: {
    query: vi.fn()
  }
}));

// Mock bcrypt
vi.mock('bcrypt', async () => {
  const actual = await vi.importActual('bcrypt');
  return {
    ...actual,
    default: {
      hash: vi.fn(),
      compare: vi.fn()
    },
    hash: vi.fn(),
    compare: vi.fn()
  };
});

// Mock jsonwebtoken
vi.mock('jsonwebtoken', async () => {
  const actual = await vi.importActual('jsonwebtoken');
  return {
    ...actual,
    default: {
      sign: vi.fn(),
      verify: vi.fn()
    },
    sign: vi.fn(),
    verify: vi.fn()
  };
});

// Import the modules after mocking
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/config';

// JWT Secret for tests
const JWT_SECRET = 'test_jwt_secret';

describe('Authentication Routes', () => {
  // Create a test router for auth routes
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Create a fresh express router
    const router = express.Router();
    
    // User registration route
    router.post('/signup', async (req, res) => {
      const { username, password, firstName, lastName, email } = req.body;
      
      try {
        // Check if username already exists
        const userCheck = await pool.query(
          'SELECT * FROM users WHERE username = $1 OR email = $2',
          [username, email]
        );
        
        if (userCheck.rows.length > 0) {
          return res.status(400).json({ 
            message: 'Username or email already exists' 
          });
        }
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert new user
        const result = await pool.query(
          'INSERT INTO users (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email',
          [username, hashedPassword, firstName, lastName, email]
        );
        
        // Create default user profile
        await pool.query(
          'INSERT INTO user_profiles (user_id, profile_type, preferences) VALUES ($1, $2, $3)',
          [result.rows[0].id, 'user', JSON.stringify({})]
        );
        
        res.status(201).json({
          message: 'User registered successfully',
          user: {
            id: result.rows[0].id,
            username: result.rows[0].username,
            email: result.rows[0].email
          }
        });
      } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
      }
    });

    // User login route
    router.post('/login', async (req, res) => {
      const { username, password } = req.body;
      
      try {
        // Find user by username
        const result = await pool.query(
          'SELECT * FROM users WHERE username = $1',
          [username]
        );
        
        if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({
          message: 'Login successful',
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
      }
    });

    // Middleware to verify JWT token
    const verifyToken = (req, res, next) => {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
      }
    };

    // Get current user info route
    router.get('/me', verifyToken, async (req, res) => {
      try {
        const result = await pool.query(
          'SELECT id, username, first_name, last_name, email FROM users WHERE id = $1',
          [req.userId]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({
          user: {
            id: result.rows[0].id,
            username: result.rows[0].username,
            firstName: result.rows[0].first_name,
            lastName: result.rows[0].last_name,
            email: result.rows[0].email
          }
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    });
    
    // Mount our test router
    app.use('/api/auth', router);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should register a new user successfully', async () => {
      // Mock the username check query (returns empty array - username is available)
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock the password hashing
      bcrypt.hash.mockResolvedValueOnce('hashed_password_123');
      
      // Mock the user creation query
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 'new-user-id', 
          username: 'testuser', 
          email: 'test@example.com' 
        }]
      });
      
      // Mock the profile creation query
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        });

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: {
          id: 'new-user-id',
          username: 'testuser',
          email: 'test@example.com'
        }
      });

      // Verify the DB queries and mocks were called correctly
      expect(pool.query).toHaveBeenCalledTimes(3);
      
      // Check the first query looked for an existing username/email
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM users WHERE username');
      expect(pool.query.mock.calls[0][1]).toEqual(['testuser', 'test@example.com']);
      
      // Check the password was hashed with bcrypt
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      
      // Check the second query created a new user
      expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO users');
      expect(pool.query.mock.calls[1][1]).toEqual([
        'testuser', 
        'hashed_password_123', 
        'Test', 
        'User', 
        'test@example.com'
      ]);
      
      // Check the third query created a user profile
      expect(pool.query.mock.calls[2][0]).toContain('INSERT INTO user_profiles');
      expect(pool.query.mock.calls[2][1][0]).toBe('new-user-id');
      expect(pool.query.mock.calls[2][1][1]).toBe('user');
      expect(pool.query.mock.calls[2][1][2]).toBe('{}');
    });

    it('should return 400 if username or email already exists', async () => {
      // Mock the username check query (returns a user - username is taken)
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 'existing-user-id', 
          username: 'testuser', 
          email: 'existing@example.com' 
        }]
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        });

      // Verify response
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: 'Username or email already exists'
      });

      // Verify only the user check query was called
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        });

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Server error during registration'
      });
    });
  });

  describe('POST /login', () => {
    it('should login a user with valid credentials', async () => {
      // Mock the user query that finds the user
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 'user-id-123', 
          username: 'testuser', 
          password: 'hashed_password',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        }]
      });
      
      // Mock the password comparison (successful)
      bcrypt.compare.mockResolvedValueOnce(true);
      
      // Mock the JWT signing
      jwt.sign.mockReturnValueOnce('mock-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: 'user-id-123',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      });

      // Verify mocks were called correctly
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][1]).toEqual(['testuser']);
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'user-id-123', username: 'testuser' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    });

    it('should return 401 if username is not found', async () => {
      // Mock the user query that doesn't find the user
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        });

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });

      // Verify only the user query was called
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 401 for incorrect password', async () => {
      // Mock the user query that finds the user
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 'user-id-123', 
          username: 'testuser', 
          password: 'hashed_password' 
        }]
      });
      
      // Mock the password comparison (unsuccessful)
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });

      // Verify the password was compared but JWT was not generated
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Server error during login'
      });
    });
  });

  describe('GET /me', () => {
    it('should return user information for authenticated request', async () => {
      // Mock JWT verification (successful)
      jwt.verify.mockReturnValueOnce({ id: 'user-id-123' });
      
      // Mock the user query
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          id: 'user-id-123', 
          username: 'testuser', 
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com'
        }]
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        user: {
          id: 'user-id-123',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com'
        }
      });

      // Verify JWT was verified and user was queried
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', JWT_SECRET);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, username, first_name, last_name, email FROM users'),
        ['user-id-123']
      );
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'No token provided'
      });

      // Verify JWT verification and database query were not called
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
      // Mock JWT verification failure
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      // Verify response
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid token'
      });

      // Verify JWT was attempted to be verified but database was not queried
      expect(jwt.verify).toHaveBeenCalled();
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      // Mock JWT verification (successful)
      jwt.verify.mockReturnValueOnce({ id: 'nonexistent-user-id' });
      
      // Mock the user query (no user found)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      // Verify response
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'User not found'
      });

      // Verify JWT was verified and user was queried
      expect(jwt.verify).toHaveBeenCalled();
      expect(pool.query).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Mock JWT verification (successful)
      jwt.verify.mockReturnValueOnce({ id: 'user-id-123' });
      
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Server error'
      });

      // Verify JWT was verified but database error was handled
      expect(jwt.verify).toHaveBeenCalled();
      expect(pool.query).toHaveBeenCalled();
    });
  });
});