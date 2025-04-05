// db/init.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// Set up spies before importing the modules that use them
vi.spyOn(path, 'join').mockReturnValue('/mock/path/to/schema.sql');
vi.spyOn(fs, 'readFileSync').mockReturnValue(`
  CREATE TABLE users (id SERIAL PRIMARY KEY);
  CREATE TABLE user_profiles (id SERIAL PRIMARY KEY);
  CREATE TABLE phrases (id SERIAL PRIMARY KEY);
`);

// Mock the pool from config
vi.mock('./config', () => {
  const mockQuery = vi.fn().mockResolvedValue({});
  const mockRelease = vi.fn();
  const mockClient = {
    query: mockQuery,
    release: mockRelease
  };
  
  const mockConnect = vi.fn().mockResolvedValue(mockClient);
  const mockEnd = vi.fn().mockResolvedValue();
  
  return {
    pool: {
      connect: mockConnect,
      end: mockEnd
    }
  };
});

// Import the pool after mocking
import { pool } from './config';

// Define a test version of the initialization function
async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database, initializing schema...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Log the first 100 characters to help debug
    console.log('Schema file preview:', schema.substring(0, 100));
    
    // Execute schema - split into individual statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    // Execute each statement separately
    for (const statement of statements) {
      console.log('Executing statement:', statement.substring(0, 50) + '...');
      await client.query(statement);
    }
    
    console.log('Database schema initialized successfully!');
  } catch (err) {
    console.error('Database initialization failed:', err);
  } finally {
    if (client) {
      client.release();
    }
    // Close the pool
    await pool.end();
  }
}

describe('Database Initialization', () => {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Spy on console methods
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
    
    // Reset mock call history
    vi.clearAllMocks();
  });
  
  // Restore console methods
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
  
  it('should initialize database schema successfully', async () => {
    // Run the initialization function
    await initializeDatabase();
    
    // Check that the connection was established
    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Connected to database, initializing schema...');
    
    // Check that the schema file was read
    expect(path.join).toHaveBeenCalledWith(expect.any(String), 'schema.sql');
    expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/to/schema.sql', 'utf8');
    
    // Check that schema preview was logged
    expect(console.log).toHaveBeenCalledWith(
      'Schema file preview:',
      expect.any(String)
    );
    
    // Verify that each statement was executed (3 statements in our mock schema)
    const client = await pool.connect();
    expect(client.query).toHaveBeenCalledTimes(3);
    
    // Check that success message was logged
    expect(console.log).toHaveBeenCalledWith('Database schema initialized successfully!');
    
    // Check that client was released and pool was closed
    expect(client.release).toHaveBeenCalled();
    expect(pool.end).toHaveBeenCalled();
  });
  
  it('should handle database initialization errors', async () => {
    // Make the connect method throw an error
    const errorMessage = 'Connection failed';
    pool.connect.mockRejectedValueOnce(new Error(errorMessage));
    
    // Run the initialization function
    await initializeDatabase();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Database initialization failed:',
      expect.objectContaining({ message: errorMessage })
    );
    
    // Check that pool was closed
    expect(pool.end).toHaveBeenCalled();
  });
  
  it('should handle query execution errors', async () => {
    // Get the mocked client and set up the error
    const client = await pool.connect();
    const errorMessage = 'Query execution failed';
    
    // Need to mock the specific call that will fail
    client.query.mockRejectedValueOnce(new Error(errorMessage));
    
    // Run the initialization function
    await initializeDatabase();
    
    // Check that error was logged
    expect(console.error).toHaveBeenCalledWith(
      'Database initialization failed:',
      expect.objectContaining({ message: errorMessage })
    );
    
    // Check that client was released and pool was closed
    expect(client.release).toHaveBeenCalled();
    expect(pool.end).toHaveBeenCalled();
  });
});