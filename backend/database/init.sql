-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    username VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255) UNIQUE,
    verification_token VARCHAR(255),
    verification_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    otp_code VARCHAR(10),
    otp_expires TIMESTAMP,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    location_method VARCHAR(20),
    city VARCHAR(100),
    avatar_url VARCHAR(512)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);
-- Remove BYTEA columns if they exist from the previous attempt
ALTER TABLE users DROP COLUMN IF EXISTS avatar_data;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_mime_type;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Add columns for password reset functionality
ALTER TABLE users
ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;

-- Create baggage table
CREATE TABLE IF NOT EXISTS baggage (
    bag_id VARCHAR(32) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    flight_number VARCHAR(16) NOT NULL,
    carousel_number INT,
    timestamps JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE baggage ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE baggage ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_baggage_user_id ON baggage(user_id);
-- Add unique index on LOWER(email)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- Create location_analytics table
CREATE TABLE IF NOT EXISTS location_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(64),
    location_method VARCHAR(20) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    country VARCHAR(100),
    region VARCHAR(100),
    ip VARCHAR(45),
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- Create slot_bookings table
CREATE TABLE IF NOT EXISTS slot_bookings (
    booking_id VARCHAR(32) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'Confirmed',
    qr_code_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_slot_bookings_user_id ON slot_bookings(user_id);

-- <<< START: NEW TABLE FOR ART SUBMISSIONS >>>
CREATE TABLE IF NOT EXISTS user_art_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    image_url VARCHAR(512) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure image_url column exists as VARCHAR
ALTER TABLE user_art_submissions ADD COLUMN IF NOT EXISTS image_url VARCHAR(512); -- This will store the GridFS ID
-- Remove BYTEA columns if they exist
ALTER TABLE user_art_submissions DROP COLUMN IF EXISTS image_data;
ALTER TABLE user_art_submissions DROP COLUMN IF EXISTS image_mime_type;
-- Create index on user_id for faster art submission lookups
CREATE INDEX IF NOT EXISTS idx_user_art_submissions_user_id ON user_art_submissions(user_id);
-- <<< END: NEW TABLE FOR ART SUBMISSIONS >>>