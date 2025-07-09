import express from 'express';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = express.Router();

// Helper to get user ID from JWT if present
function getUserIdFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

// POST /api/location
router.post('/', async (req, res) => {
  const location = req.body;
  const userId = getUserIdFromRequest(req);

  // Insert into analytics table
  await query(
    `INSERT INTO location_analytics
      (user_id, location_method, latitude, longitude, accuracy, country, region, ip, error)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      userId,
      location.location_method,
      location.latitude || null,
      location.longitude || null,
      location.accuracy || null,
      location.country || null,
      location.region || null,
      location.ip || null,
      location.error || null
    ]
  );

  // Update user's latest location (if authenticated)
  if (userId && location.latitude && location.longitude) {
    await query(
      'UPDATE users SET latitude = $1, longitude = $2, accuracy = $3, location_method = $4 WHERE id = $5',
      [location.latitude, location.longitude, location.accuracy || null, location.location_method || null, userId]
    );

    // Reverse geocode to city and country using OpenCage
    try {
      const openCageKey = process.env.OPENCAGE_KEY;
      const geoUrl = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${openCageKey}`;
      const geoRes = await axios.get(geoUrl);
      const result = geoRes.data && geoRes.data.results && geoRes.data.results[0];
      const city = result?.components?.city || result?.components?.town || result?.components?.village || result?.components?.municipality || null;
      const country = result?.components?.country || null;
      if (city || country) {
        await query('UPDATE users SET city = $1, country = $2 WHERE id = $3', [city, country, userId]);
      }
    } catch (err) {
      console.error('OpenCage reverse geocoding error:', err.message);
    }
  }

  res.json({ success: true });
});

export default router; 