// GLPAAC-back-end/db/config.js
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'glpaac_db',
  password: process.env.DB_PASSWORD || 'Alabama89!',
  port: process.env.DB_PORT || 5432,
});

module.exports = { pool };