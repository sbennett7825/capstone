// // GLPAAC-back-end/routes/userSettings.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db/config');
const auth = require('../middleware/auth');

// Save voice settings
router.post('/voice', auth, async (req, res) => {
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

// Get voice settings
router.get('/voice', auth, async (req, res) => {
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

module.exports = router;