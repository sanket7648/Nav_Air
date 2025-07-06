import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Create pool with enhanced configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'auth_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  acquireTimeoutMillis: 10000,
  reapIntervalMillis: 1000,
  createTimeoutMillis: 10000,
  destroyTimeoutMillis: 5000,
});

// Enhanced connection logging
pool.on('connect', () => {
  if (!pool._loggedConnection) {
    console.log('✅ Connected to PostgreSQL database');
    pool._loggedConnection = true;
  }
});

pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit the process, let the retry logic handle it
});

// Retry wrapper function
const executeWithRetry = async (queryFn, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isConnectionError = error.code === 'ECONNRESET' || 
                               error.code === 'ENOTFOUND' || 
                               error.message.includes('timeout') ||
                               error.message.includes('connection');

      if (isConnectionError && !isLastAttempt) {
        console.log(`⚠️  Database connection attempt ${attempt} failed, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }

      // If it's the last attempt or not a connection error, throw the error
      throw error;
    }
  }
};

// Enhanced query function with retry logic
const queryWithRetry = async (text, params = []) => {
  return executeWithRetry(() => pool.query(text, params));
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    await queryWithRetry('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed gracefully');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
  }
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

export default pool;
export { queryWithRetry, checkDatabaseHealth, closePool }; 