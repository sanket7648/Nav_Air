import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/database.js';
import { generateToken, generateVerificationToken, verifyVerificationToken } from '../utils/jwt.js';
import { sendVerificationEmail } from '../services/emailService.js';
import { authenticateToken, checkUserVerified } from '../middleware/auth.js';
import { validateRegistration, validateLogin, validateEmailVerification } from '../middleware/validation.js';

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Register user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, username, contact_number, country } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Calculate expiry time (10 minutes from now)
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (email, hashed_password, username, contact_number, country, verification_token, verification_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, username`,
      [email, hashedPassword, username, contact_number, country, verificationToken, verificationExpires]
    );

    const user = result.rows[0];

    // Send verification email
    const emailSent = await sendVerificationEmail(email, username, verificationToken);

    if (!emailSent) {
      // If email fails, delete the user
      await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify email
router.post('/verify-email', validateEmailVerification, async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = verifyVerificationToken(token);
    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Find user with this verification token
    const result = await pool.query(
      'SELECT id, email, username, verification_expires FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const user = result.rows[0];

    // Check if token is expired
    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Update user as verified
    await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, verification_expires = NULL WHERE id = $1',
      [user.id]
    );

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
router.post('/login', validateLogin, checkUserVerified, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await pool.query(
      'SELECT id, email, username, hashed_password FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Google OAuth login
router.get('/google', (req, res) => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  });
  res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let result = await pool.query(
      'SELECT id, email, username, is_verified FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );

    let user;

    if (result.rows.length > 0) {
      // User exists, update google_id if not set
      user = result.rows[0];
      if (!user.google_id) {
        await pool.query(
          'UPDATE users SET google_id = $1 WHERE id = $2',
          [googleId, user.id]
        );
      }
    } else {
      // Create new user
      result = await pool.query(
        `INSERT INTO users (email, username, google_id, is_verified)
         VALUES ($1, $2, $3, true)
         RETURNING id, email, username, is_verified`,
        [email, name, googleId]
      );
      user = result.rows[0];
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id });

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&success=true`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google OAuth error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?success=false&message=Authentication failed`;
    res.redirect(redirectUrl);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, contact_number, country, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 