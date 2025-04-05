// dbConfig.test.js
import { pool } from './db/config.js';
import { describe, it, expect } from 'vitest';
import { Pool } from 'pg';

describe('Database Configuration', () => {
  it('should connect to the database successfully', async () => {
    try {
      const client = await pool.connect();
      expect(client).toBeDefined();
      await client.release();
    } catch (error) {
      throw new Error('Database connection failed: ' + error.message);
    }
  });

  it('should throw an error for invalid credentials', async () => {
    const invalidPool = new Pool({
      user: 'invalid_user',
      host: 'localhost',
      database: 'invalid_db',
      password: 'invalid_password',
      port: 5432,
    });

    try {
      const client = await invalidPool.connect();
      await client.release();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toMatch(/authentication failed/i);
    }
  });
});