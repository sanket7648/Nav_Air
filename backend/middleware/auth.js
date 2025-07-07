import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user from database
    // Corrected and working code

    // Get user from database
    const userRows = await query(
      'SELECT id, email, username, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    // Safely check if the returned array is empty
    if (!userRows || userRows.length === 0) { // <--- FIXED LINE
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userRows[0]; // Get the user from the array directly

    // Check if user is verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to check if user is verified (for login)
export const checkUserVerified = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Correctly handle the direct array returned by query()
    const userRows = await query(
      'SELECT id, email, username, is_verified, google_id FROM users WHERE LOWER(email) = $1',
      [email.toLowerCase()]
    );

    // Safely check if the user exists
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userRows[0]; // Get user from the array

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }

    next();
  } catch (error) {
    console.error('Check user verified error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
