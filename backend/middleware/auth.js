import { verifyToken } from '../utils/jwt.js';
import pool from '../config/database.js';

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
    const result = await pool.query(
      'SELECT id, email, username, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    
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
    const result = await pool.query(
      'SELECT is_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    
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