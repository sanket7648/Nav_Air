import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Create Neon client
const sql = neon(process.env.DATABASE_URL);

// Simple query function (mimics pg's pool.query)
const query = async (text, params = []) => {
  const result = await sql.query(text, params);
  console.log('Query result:', result);
  return result;
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  }
};

// Graceful shutdown (no-op for serverless, but kept for API compatibility)
const closePool = async () => {
  // No pool to close in serverless driver
  console.log('✅ Neon serverless: no pool to close');
};

// Handle process termination
process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

export default { query };
export { query, checkDatabaseHealth, closePool }; 
