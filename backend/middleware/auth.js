import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader); // Log header
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('Authentication failed: No token provided.'); // Log missing token
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = verifyToken(token);
    // Add check for userId in decoded token
    if (!decoded || !decoded.userId) {
      console.log('Authentication failed: Invalid token payload or missing userId.');
      return res.status(403).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    console.log('Decoded Token Payload:', decoded); // Log decoded payload

    // Get user from database
    console.log(`Fetching user with ID: ${decoded.userId}`); // Log before query
    const userResult = await query(
      'SELECT id, email, username, is_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    // Check query result
    if (!userResult || !userResult.rows || userResult.rows.length === 0) {
      console.log(`Authentication failed: User with ID ${decoded.userId} not found in database.`);
      return res.status(403).json({ // Changed from 404 to 403 for consistency
        success: false,
        message: 'User associated with token not found' // More specific message
      });
    }
    const user = userResult.rows[0];
    console.log('User found in DB:', { id: user.id, email: user.email, is_verified: user.is_verified }); // Log user found

    // Check if user is verified
    if (!user.is_verified) {
      console.log(`Authentication failed: User ${user.id} email not verified.`); // Log verification fail
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email first.'
      });
    }

    console.log(`Authentication successful for user ID: ${user.id}. Setting req.user.`); // Log success
    req.user = user; // Attach user to request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Log the actual error during verification or DB query
    console.error('Auth middleware error:', error); // Log the actual error
    return res.status(403).json({
      success: false,
      message: 'Invalid token or server error during authentication' // More accurate message
    });
  }
};

// Middleware to check if user is verified (for login)
export const checkUserVerified = async (req, res, next) => {
  const { email } = req.body;

  try {
    const userResult = await query(
      'SELECT id, email, username, is_verified, google_id FROM users WHERE LOWER(email) = $1',
      [email.toLowerCase()]
    );
    if (!userResult || !userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const user = userResult.rows[0];

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