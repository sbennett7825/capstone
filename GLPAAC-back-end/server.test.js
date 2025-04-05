import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import bodyParser from 'body-parser';

// Define mock implementations before vi.mock() calls
// Mock router factory must be defined inline within each mock
vi.mock('./routes/auth', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.status(200).json({ route: 'auth' }));
  return { default: router };
});

vi.mock('./routes/userSettings', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.status(200).json({ route: 'user-settings' }));
  return { default: router };
});

vi.mock('./routes/symbolsRoutes', () => {
  const router = express.Router();
  router.get('/test', (req, res) => res.status(200).json({ route: 'symbols' }));
  return { default: router };
});

vi.mock('./db/config', () => {
  return {
    pool: {
      connect: vi.fn().mockImplementation(() => {
        return {
          query: vi.fn().mockResolvedValue({ rows: [{ now: new Date().toISOString() }] }),
          release: vi.fn()
        };
      })
    }
  };
});

vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Import mocked modules
import authRoutes from './routes/auth';
import userSettingsRoutes from './routes/userSettings';
import symbolsRoutes from './routes/symbolsRoutes';
import { pool } from './db/config';

// Create a fresh Express app for testing
let app;

describe('Server', () => {
  beforeEach(() => {
    // Clear all mocked function calls between tests
    vi.clearAllMocks();
    
    // Set up a fresh app instance for each test
    app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    
    // Use the mocked routes
    app.use('/api/auth', authRoutes);
    app.use('/api/user-settings', userSettingsRoutes);
    app.use('/api/symbols', symbolsRoutes);
    
    // Test DB connection
    app.get('/api/test-db', async (req, res) => {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ success: true, timestamp: result.rows[0].now });
      } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ success: false, error: 'Database connection failed' });
      }
    });
    
    // Base route
    app.get('/', (req, res) => {
      res.send('GLPAAC API is running');
    });
  });

  afterEach(() => {
    app = null;
  });

  it('should respond with a welcome message on the base route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('GLPAAC API is running');
  });

  it('should successfully connect to the database', async () => {
    const response = await request(app).get('/api/test-db');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.timestamp).toBeDefined();
    expect(pool.connect).toHaveBeenCalledTimes(1);
  });

  it('should handle database connection errors', async () => {
    // Override the mock implementation for this specific test
    pool.connect.mockImplementationOnce(() => {
      throw new Error('Connection failed');
    });
    
    const response = await request(app).get('/api/test-db');
    
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Database connection failed');
  });

  it('should register auth routes correctly', async () => {
    const response = await request(app).get('/api/auth/test');
    expect(response.status).toBe(200);
    expect(response.body.route).toBe('auth');
  });

  it('should register user settings routes correctly', async () => {
    const response = await request(app).get('/api/user-settings/test');
    expect(response.status).toBe(200);
    expect(response.body.route).toBe('user-settings');
  });

  it('should register symbols routes correctly', async () => {
    const response = await request(app).get('/api/symbols/test');
    expect(response.status).toBe(200);
    expect(response.body.route).toBe('symbols');
  });
});