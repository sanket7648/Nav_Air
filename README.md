# NavAir Authentication System

A complete user authentication system built with Node.js, Express, PostgreSQL, and React TypeScript. Features secure user registration, email verification, JWT authentication, and Google OAuth integration.

## 🚀 Features

### Backend (Node.js + Express + PostgreSQL)
- ✅ **User Registration** with email verification
- ✅ **Secure Password Hashing** using bcrypt
- ✅ **JWT Authentication** with token management
- ✅ **Google OAuth 2.0** integration
- ✅ **Email Service** using Nodemailer
- ✅ **Input Validation** with express-validator
- ✅ **Rate Limiting** and security headers
- ✅ **PostgreSQL Database** with proper indexing

### Frontend (React + TypeScript)
- ✅ **Modern UI/UX** with glass morphism effects
- ✅ **Responsive Design** for all devices
- ✅ **TypeScript** for type safety
- ✅ **Protected Routes** with authentication checks
- ✅ **Real-time Validation** and error handling
- ✅ **Google OAuth** frontend integration
- ✅ **Dark Mode Support**


## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **google-auth-library** - Google OAuth
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Gmail account for email service
- Google OAuth 2.0 credentials

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd navair-auth-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up PostgreSQL database
createdb auth_db
psql -d auth_db -f database/init.sql

# Configure environment variables
cp env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start the development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🔐 Authentication Flow

### 1. User Registration
1. User fills registration form
2. Backend validates input and hashes password
3. User record created with `is_verified = false`
4. Verification email sent with JWT token
5. User redirected to email verification

### 2. Email Verification
1. User clicks verification link
2. Frontend extracts token from URL
3. Backend verifies token and marks user as verified
4. User can now login

### 3. User Login
1. User enters email and password
2. Backend verifies credentials and email verification
3. JWT token generated and returned
4. Frontend stores token in localStorage
5. User redirected to protected area

### 4. Google OAuth
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. Google redirects back with authorization code
4. Backend exchanges code for user info
5. User created/updated and JWT token generated
6. User authenticated and redirected

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /health` - Server health check


## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Signed with secret key, 7-day expiry
- **Email Verification**: Required before login
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js protection
- **Input Validation**: Express-validator sanitization
- **CORS**: Configured for frontend origin
- **SQL Injection Protection**: Parameterized queries

**Built with ❤️ using modern web technologies** 