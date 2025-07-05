# Authentication Backend

A complete user authentication system built with Node.js, Express, PostgreSQL, and JWT.

## Features

- ✅ User registration with email verification
- ✅ Secure password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Google OAuth 2.0 integration
- ✅ Email verification with OTP
- ✅ Input validation and sanitization
- ✅ Rate limiting and security headers
- ✅ PostgreSQL database with proper indexing

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Gmail account for email service
- Google OAuth 2.0 credentials

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE auth_db;
   ```

3. **Run database initialization:**
   ```bash
   psql -d auth_db -f database/init.sql
   ```

4. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=auth_db
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Email (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

   # Server
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

## Email Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## Google OAuth Setup

1. **Create Google OAuth 2.0 credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Set authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

2. **Add credentials to .env:**
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)

### Health Check

- `GET /health` - Server health check

## API Documentation

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "contact_number": "+1234567890",
  "country": "United States"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

## Security Features

- **Password Hashing:** bcrypt with 12 salt rounds
- **JWT Tokens:** Signed with secret key, 7-day expiry
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Security Headers:** Helmet.js for protection
- **Input Validation:** Express-validator for sanitization
- **CORS:** Configured for frontend origin
- **Email Verification:** Required before login

## Database Schema

```sql
CREATE TABLE users (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Error Handling

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── database/
│   └── init.sql            # Database initialization
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation
├── routes/
│   └── auth.js             # Authentication routes
├── services/
│   └── emailService.js     # Email service
├── utils/
│   └── jwt.js              # JWT utilities
├── server.js               # Main server file
├── package.json
└── README.md
```

### Adding New Features

1. Create new route files in `routes/`
2. Add middleware in `middleware/`
3. Create services in `services/`
4. Update database schema if needed
5. Add validation rules
6. Test thoroughly

## Troubleshooting

### Common Issues

1. **Database Connection Failed:**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Email Not Sending:**
   - Verify Gmail app password
   - Check 2FA is enabled
   - Test SMTP settings

3. **Google OAuth Not Working:**
   - Verify client ID and secret
   - Check redirect URI matches exactly
   - Ensure Google+ API is enabled

4. **JWT Token Issues:**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header
   - Check token expiration

## License

ISC 