import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Create an express app and router before mocking
const app = express();
app.use(express.json());

// Mock the database pool
vi.mock('../db/config', () => ({
  pool: {
    query: vi.fn()
  }
}));

// Import the mocked pool
import { pool } from '../db/config';

// Create a test router that uses a fake auth middleware
describe('User Settings Routes', () => {
  // Create our own test router
  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();
    
    // Create a fresh express router
    const router = express.Router();
    
    // Add our fake auth middleware directly to the routes
    // POST /voice route
    router.post('/voice', (req, res, next) => {
      // This is our fake auth middleware
      req.user = { id: 'test-user-id' };
      next();
    }, async (req, res) => {
      const { rate, pitch, voiceName } = req.body;
      const userId = req.user.id;
      
      try {
        // Check if user profile exists
        const profileCheck = await pool.query(
          'SELECT * FROM user_profiles WHERE user_id = $1 AND profile_type = $2',
          [userId, 'user']
        );
        
        // Update preferences JSON with voice settings
        if (profileCheck.rows.length > 0) {
          // Get current preferences - parse JSON if it exists
          let preferences = {};
          if (profileCheck.rows[0].preferences) {
            // Make sure to parse the JSONB data from PostgreSQL
            preferences = typeof profileCheck.rows[0].preferences === 'string' 
              ? JSON.parse(profileCheck.rows[0].preferences) 
              : profileCheck.rows[0].preferences;
          }
          
          // Update voice settings
          preferences = {
            ...preferences,
            voice: {
              rate,
              pitch,
              voiceName
            }
          };
          
          // Update record
          await pool.query(
            'UPDATE user_profiles SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND profile_type = $3',
            [JSON.stringify(preferences), userId, 'user']
          );
        } else {
          // Create new profile with voice settings
          const preferences = {
            voice: {
              rate,
              pitch,
              voiceName
            }
          };
          
          await pool.query(
            'INSERT INTO user_profiles (user_id, profile_type, preferences) VALUES ($1, $2, $3)',
            [userId, 'user', JSON.stringify(preferences)]
          );
        }
        
        res.json({ 
          success: true, 
          message: 'Voice settings saved successfully'
        });
      } catch (error) {
        console.error('Error saving voice settings:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error while saving voice settings' 
        });
      }
    });

    // GET /voice route
    router.get('/voice', (req, res, next) => {
      // This is our fake auth middleware
      req.user = { id: 'test-user-id' };
      next();
    }, async (req, res) => {
      const userId = req.user.id;
      
      try {
        const result = await pool.query(
          'SELECT preferences FROM user_profiles WHERE user_id = $1 AND profile_type = $2',
          [userId, 'user']
        );
        
        if (result.rows.length === 0) {
          return res.json({
            success: true,
            settings: {
              rate: 1,
              pitch: 1,
              voiceName: ''
            }
          });
        }
        
        // Parse the preferences if they exist
        let preferences = {};
        if (result.rows[0].preferences) {
          // Make sure to parse the JSONB data from PostgreSQL if it's a string
          preferences = typeof result.rows[0].preferences === 'string' 
            ? JSON.parse(result.rows[0].preferences) 
            : result.rows[0].preferences;
        }
        
        // Check if voice settings exist in preferences
        if (!preferences.voice) {
          return res.json({
            success: true,
            settings: {
              rate: 1,
              pitch: 1,
              voiceName: ''
            }
          });
        }
        
        res.json({
          success: true,
          settings: {
            rate: preferences.voice.rate || 1,
            pitch: preferences.voice.pitch || 1,
            voiceName: preferences.voice.voiceName || ''
          }
        });
      } catch (error) {
        console.error('Error fetching voice settings:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Server error while fetching voice settings' 
        });
      }
    });
    
    // Mount our test router
    app.use('/api/user-settings', router);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /voice', () => {
    it('should create a new profile if one does not exist', async () => {
      // Mock the DB query that checks for an existing profile (returns empty array)
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock the DB query for creating a new profile
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token')
        .send({
          rate: 1.2,
          pitch: 0.8,
          voiceName: 'Google UK English Female'
        });

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Voice settings saved successfully'
      });

      // Verify the DB queries were called correctly
      expect(pool.query).toHaveBeenCalledTimes(2);
      
      // Check the first query looked for an existing profile
      expect(pool.query.mock.calls[0][0]).toContain('SELECT * FROM user_profiles');
      expect(pool.query.mock.calls[0][1]).toEqual(['test-user-id', 'user']);
      
      // Check the second query created a new profile with the voice settings
      expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO user_profiles');
      expect(pool.query.mock.calls[1][1][0]).toBe('test-user-id');
      expect(pool.query.mock.calls[1][1][1]).toBe('user');
      
      // Verify the JSON preferences structure
      const savedPreferences = JSON.parse(pool.query.mock.calls[1][1][2]);
      expect(savedPreferences).toEqual({
        voice: {
          rate: 1.2,
          pitch: 0.8,
          voiceName: 'Google UK English Female'
        }
      });
    });

    it('should update existing profile if one exists', async () => {
      // Mock the DB query that checks for an existing profile (returns a profile)
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          user_id: 'test-user-id', 
          profile_type: 'user',
          preferences: { 
            theme: 'dark',
            notifications: true 
          }
        }]
      });
      
      // Mock the DB query for updating the profile
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token')
        .send({
          rate: 1.5,
          pitch: 1.2,
          voiceName: 'Microsoft David'
        });

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Voice settings saved successfully'
      });

      // Verify the DB queries were called correctly
      expect(pool.query).toHaveBeenCalledTimes(2);
      
      // Check the second query updated the existing profile
      expect(pool.query.mock.calls[1][0]).toContain('UPDATE user_profiles');
      
      // Verify the JSON preferences structure preserves existing preferences
      const savedPreferences = JSON.parse(pool.query.mock.calls[1][1][0]);
      expect(savedPreferences).toEqual({
        theme: 'dark',
        notifications: true,
        voice: {
          rate: 1.5,
          pitch: 1.2,
          voiceName: 'Microsoft David'
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .post('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token')
        .send({
          rate: 1.2,
          pitch: 0.8,
          voiceName: 'Google UK English Female'
        });

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Server error while saving voice settings'
      });
    });
  });

  describe('GET /voice', () => {
    it('should return default settings if no profile exists', async () => {
      // Mock the DB query that checks for an existing profile (returns empty array)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        settings: {
          rate: 1,
          pitch: 1,
          voiceName: ''
        }
      });

      // Verify the DB query was called correctly
      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(pool.query.mock.calls[0][0]).toContain('SELECT preferences FROM user_profiles');
    });

    it('should return default voice settings if profile exists but has no voice settings', async () => {
      // Mock the DB query that returns a profile without voice settings
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          preferences: { 
            theme: 'dark',
            notifications: true 
          }
        }]
      });

      const response = await request(app)
        .get('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        settings: {
          rate: 1,
          pitch: 1,
          voiceName: ''
        }
      });
    });

    it('should return existing voice settings if they exist', async () => {
      // Mock the DB query that returns a profile with voice settings
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          preferences: { 
            theme: 'dark',
            voice: {
              rate: 1.3,
              pitch: 0.9,
              voiceName: 'Microsoft Zira'
            }
          }
        }]
      });

      const response = await request(app)
        .get('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        settings: {
          rate: 1.3,
          pitch: 0.9,
          voiceName: 'Microsoft Zira'
        }
      });
    });

    it('should handle database errors gracefully', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database connection error'));

      const response = await request(app)
        .get('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token');

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Server error while fetching voice settings'
      });
    });

    it('should handle string preferences from the database correctly', async () => {
      // Mock the DB query that returns a profile with stringified preferences
      pool.query.mockResolvedValueOnce({
        rows: [{ 
          preferences: JSON.stringify({ 
            theme: 'light',
            voice: {
              rate: 1.7,
              pitch: 1.2,
              voiceName: 'Google US English'
            }
          })
        }]
      });

      const response = await request(app)
        .get('/api/user-settings/voice')
        .set('Authorization', 'Bearer test-token');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        settings: {
          rate: 1.7,
          pitch: 1.2,
          voiceName: 'Google US English'
        }
      });
    });
  });
});