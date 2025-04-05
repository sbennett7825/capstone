// GLPAAC-back-end/routes/symbolsRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// OpenSymbols API proxy endpoint
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    const response = await axios.get('https://www.opensymbols.org/api/v2/symbols', {
      params: {
        access_token: process.env.OPENSYMBOLS_ACCESS_KEY,
        q: query
      }
    });
    
    // Return the response data directly to maintain the same structure
    res.json(response.data);
  } catch (error) {
    console.error('OpenSymbols API error:', error.message);
    
    // Send more informative error
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch symbols',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;