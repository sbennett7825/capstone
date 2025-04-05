const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const userSettingsRoutes = require('./routes/userSettings');
const symbolsRoutes = require('./routes/symbolsRoutes'); // Import our new route
const { pool } = require('./db/config');
const dotenv = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user-settings', userSettingsRoutes);
app.use('/api/symbols', symbolsRoutes); // Register our new route

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});