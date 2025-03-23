// GLPAAC-back-end/db/init.js
const fs = require('fs');
const path = require('path');
const { pool } = require('./config');

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

// Run initialization
initializeDatabase();