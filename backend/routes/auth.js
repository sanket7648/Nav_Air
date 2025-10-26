import express from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { query } from '../config/database.js';
import { generateToken, generateVerificationToken, verifyVerificationToken } from '../utils/jwt.js';
import { sendVerificationEmail, generateOTP, sendOtpEmail } from '../services/emailService.js';
import { authenticateToken, checkUserVerified } from '../middleware/auth.js';
import { validateRegistration, validateLogin, validateEmailVerification } from '../middleware/validation.js';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../services/emailService.js';
import multer from 'multer';
import path from 'path';
import { getAvatarBucket } from '../config/mongo.js';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const avatarStorage = multer.memoryStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars'); // Adjust path as needed
    fs.mkdirSync(uploadDir, { recursive: true }); // Create directory if it doesn't exist
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use user ID and timestamp for unique filename
    const uniqueSuffix = req.user.id + '-' + Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});
// --- End Multer Configuration ---

// Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Register user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { email, password, username, contact_number, country, city } = req.body;

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
      `INSERT INTO users (email, hashed_password, username, contact_number, country, city, verification_token, verification_expires, otp_code, otp_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, username`,
      [email, hashedPassword, username, contact_number, country, city, verificationToken, verificationExpires, otp, otpExpires]
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

    if (userRows && userRows.rows && userRows.rows.length > 0) {
      // 3. If USER EXISTS, use their data.
      user = userRows.rows[0];
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
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    // Redirect or respond as needed
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}&success=true`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error("Google OAuth callback error:", error);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?success=false&message=Authentication failed`;
    res.redirect(redirectUrl);
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // For security, don't reveal if user exists
      return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    }
    const user = userResult.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await query('UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3', [token, expires, user.id]);
    await sendResetPasswordEmail(email, token);
    return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password are required' });
  try {
    const userResult = await query('SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()', [token]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2', [hashedPassword, user.id]);
    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me - Get current user (Make sure it includes avatar_url)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch fresh user data including the avatar_url
    const result = await query('SELECT id, email, username, contact_number, country, city, created_at, avatar_url FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
       return res.status(404).json({ success: false, message: 'User not found' });
    }
    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        contact_number: user.contact_number,
        country: user.country,
        city: user.city,
        created_at: user.created_at,
        avatarUrl: user.avatar_url ? `/api/images/avatar/${user.avatar_url}` : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { city, country } = req.body;
    const userId = req.user.id;

    // Update user profile
    await query(
      'UPDATE users SET city = $1, country = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [city, country, userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/auth/avatar
router.put('/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  // <<< ADD THIS LOGGING >>>
  console.log('--- Avatar Upload Request ---');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body); // Also log body in case fields are mixed up
  // <<< END LOGGING >>>
  try {
    if (!req.file) {
      console.error('req.file is undefined after multer.');
      return res.status(400).json({ success: false, message: 'No avatar file uploaded.' });
    }
    // --- Check buffer existence early ---
    if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error('Multer processed the file but the buffer is missing or empty.', req.file); // Log the file object
        return res.status(400).json({ success: false, message: 'Uploaded file buffer is missing or empty.' });
    }
    // --- End buffer check ---

    const userId = req.user.id;
    const bucket = getAvatarBucket();
    if (!bucket) {
        throw new Error("GridFS Avatar Bucket not initialized.");
    }

    const filename = req.file.originalname;
    const contentType = req.file.mimetype;

    // --- Create a Promise wrapper using write/end ---
    const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: contentType,
            metadata: { userId: userId }
        });
        const streamId = uploadStream.id; // Get the ID immediately

        // Handle errors on the GridFS upload stream
        uploadStream.on('error', (error) => {
            console.error(`GridFS upload stream error for ID ${streamId}:`, error);
            reject(new Error('Failed to save avatar to storage.'));
        });

        // Resolve the promise ONLY when GridFS confirms the file is written
        uploadStream.on('finish', () => {
            console.log(`GridFS upload finished event for file ID: ${streamId}`);
            resolve(streamId); // Resolve with the ID
        });

        // Write the buffer directly to the stream
        uploadStream.write(req.file.buffer, (error) => {
             if (error) {
                 console.error(`GridFS stream write error for ID ${streamId}:`, error);
                 return reject(new Error('Failed during avatar data write.'));
             }
             // After writing, end the stream to trigger 'finish'
             uploadStream.end(() => {
                console.log(`GridFS stream ended for ID ${streamId}. Waiting for finish event.`);
             });
        });

    });
    // --- End Promise wrapper ---

    // Wait for the upload to finish and get the GridFS ID
    const gridFsObjectId = await uploadPromise;
    const gridFsId = gridFsObjectId.toString();

    console.log(`Successfully uploaded to GridFS, ID: ${gridFsId}. Updating PostgreSQL.`);

    // Now, update PostgreSQL
    await query(
      'UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [gridFsId, userId]
    );

    res.json({
      success: true,
      message: 'Avatar updated successfully.',
      avatarUrl: `/api/images/avatar/${gridFsId}?t=${Date.now()}` // Add timestamp
    });

  } catch (error) {
     // ... (keep the existing detailed error handling from the previous step) ...
     console.error('Avatar upload process error:', error);
     if (error instanceof multer.MulterError || error.message.includes('Failed during') || error.message.includes('Failed to save')) {
         return res.status(500).json({ success: false, message: error.message });
     }
    res.status(500).json({ success: false, message: 'Internal server error during avatar upload setup.' });
  }
});

export default router; 