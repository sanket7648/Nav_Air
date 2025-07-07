import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import { generateToken, generateVerificationToken, verifyVerificationToken } from '../utils/jwt.js';
import { sendVerificationEmail, generateOTP, sendOtpEmail } from '../services/emailService.js';
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
    const existingUser = await query(
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
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Insert user into database
    const result = await query(
      `INSERT INTO users (email, hashed_password, username, contact_number, country, verification_token, verification_expires, otp_code, otp_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, username`,
      [email, hashedPassword, username, contact_number, country, verificationToken, verificationExpires, otp, otpExpires]
    );

    const user = result.rows[0];

    // Send verification email (link)
    const emailSent = await sendVerificationEmail(email, username, verificationToken);
    // Send OTP email
    const otpSent = await sendOtpEmail(email, username, otp);

    if (!emailSent && !otpSent) {
      // If both emails fail, delete the user
      await query('DELETE FROM users WHERE id = $1', [user.id]);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email and OTP. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account (link or OTP).',
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
    const result = await query(
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
    await query(
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

// OTP verification endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required.' });
    }
    // Find user by OTP
    const result = await query('SELECT id, otp_code, otp_expires, is_verified FROM users WHERE otp_code = $1', [otp]);
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    const user = result.rows[0];
    if (user.is_verified) {
      return res.status(400).json({ success: false, message: 'User already verified.' });
    }
    if (!user.otp_code || !user.otp_expires) {
      return res.status(400).json({ success: false, message: 'No OTP found for this user.' });
    }
    if (user.otp_code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }
    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }
    // Mark user as verified and clear OTP fields
    await query('UPDATE users SET is_verified = true, otp_code = NULL, otp_expires = NULL WHERE id = $1', [user.id]);
    res.json({ success: true, message: 'OTP verified successfully. You can now login.' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, checkUserVerified, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT id, email, username, hashed_password FROM users WHERE LOWER(email) = $1',
      [email.toLowerCase()]
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
    const { sub: google_id, email, name } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if the user already exists in your database
    const userRows = await query('SELECT * FROM users WHERE email = $1', [email]);

    let user;

    if (userRows && userRows.length > 0) { // Check if userRows is not null/undefined first
      // 3. If USER EXISTS, use their data.
      user = userRows[0];
      console.log(`User found: ${user.email}. Logging in.`);
    } else {
      // User does not exist, create new
      console.log(`New user: ${normalizedEmail}. Creating account.`);
      const newUserResult = await query(
        'INSERT INTO users (email, username, google_id, is_verified) VALUES ($1, $2, $3, $4) RETURNING *',
        [normalizedEmail, name, google_id, true]
      );
      user = newUserResult.rows[0];
    }

    // Generate JWT
    const token = generateToken({ userId: user.id });

    // Redirect or respond as needed
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&success=true`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?success=false&message=Authentication failed`;
    res.redirect(redirectUrl);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userRows = await query(
      'SELECT id, email, username, contact_number, country, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const userDetails = userRows[0];
    res.json({
      success: true,
      user: userDetails
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