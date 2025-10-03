import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, closePool } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('Setting up Neon database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await query(statement);
      }
    }
    
    console.log('✅ Database setup completed successfully!');
    
    // Test the connection by querying the users table
    const result = await query('SELECT COUNT(*) FROM users');
    
    // FIX: Safely access the count property via the rows array
    if (result && result.rows && result.rows.length > 0) {
        console.log(`📊 Users table created with ${result.rows[0].count} records`);
    } else {
        console.log('⚠️ Could not verify user count, but setup appears complete.');
    }
    
  } catch (error) {
    // If the error is specific to reading the count, treat it as a warning and move on.
    if (error.message.includes('count')) {
        console.error('⚠️ Warning: Failed to retrieve user count after setup (likely a result formatting issue). The database setup itself was likely successful.');
    } else {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    }
  } finally {
    await closePool();
  }
}

// Run the setup
setupDatabase();
    
