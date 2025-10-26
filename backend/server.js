import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import baggageRoutes from './routes/baggage.js';
import locationRoutes from './routes/location.js';
import flightsRoutes from './routes/flights.js';
import db, { query, checkDatabaseHealth, closePool } from './config/database.js';
import { verifyTransporter } from './services/emailService.js';
import navigationRoutes from './routes/navigation.js';
import bookingRoutes from './routes/booking.js';
import artSubmissionRoutes from './routes/artSubmissions.js'; // <<< Import the new router
import path from 'path'; // <<< Import path
import { fileURLToPath } from 'url'; // <<< Import fileURLToPath
import { connectDB } from './config/mongo.js';
import imageRoutes from './routes/images.js';



// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust first proxy (needed for ngrok and express-rate-limit)
const PORT = process.env.PORT || 5001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/baggage', baggageRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/art-submissions', artSubmissionRoutes);
app.use('/api/images', imageRoutes);

app.get('/test-user', async (req, res) => {
  const result = await query(
    'SELECT id, email FROM users WHERE LOWER(email) = $1',
    ['sanketjha177@gmail.com']
  );
  res.json(result);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    try {
      await query('SELECT NOW()');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('Error connecting to database:', error);
    }

    await connectDB();

    // Test email transporter
    await verifyTransporter();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Email service: ${process.env.EMAIL_HOST ? 'Configured' : 'Not configured'}`);
      console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
      console.log(`💾 MongoDB: Connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closePool();
  process.exit(0);
});
