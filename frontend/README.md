# NavAir Frontend

A modern React TypeScript frontend for the NavAir authentication system with beautiful UI and seamless user experience.

## Features

- ✅ **Modern UI/UX**: Beautiful gradient designs with glass morphism effects
- ✅ **User Registration**: Complete registration form with validation
- ✅ **Email Verification**: OTP-based email verification system
- ✅ **User Login**: Secure login with JWT authentication
- ✅ **Google OAuth**: Seamless Google sign-in integration
- ✅ **Protected Routes**: Authentication-based route protection
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **Dark Mode Support**: Built-in dark mode compatibility
- ✅ **TypeScript**: Full TypeScript support for type safety
- ✅ **Tailwind CSS**: Utility-first CSS framework

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running (see backend README)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
frontend/src/
├── components/
│   ├── Navigation.tsx          # Main navigation component
│   ├── ProtectedRoute.tsx      # Authentication route wrapper
│   └── FloatingActionButton.tsx
├── pages/
│   ├── login.tsx               # Login page
│   ├── registeruser.tsx        # Registration page
│   ├── VerifyEmail.tsx         # Email verification page
│   ├── AuthCallback.tsx        # OAuth callback page
│   └── ...                     # Other app pages
├── services/
│   └── api.ts                  # API service and utilities
├── App.tsx                     # Main app component
└── main.tsx                    # App entry point
```

## Authentication Flow

### 1. Registration
1. User fills out registration form
2. Form validation ensures data integrity
3. API call to `/api/auth/register`
4. Email verification link sent to user
5. User redirected to verification page

### 2. Email Verification
1. User clicks verification link from email
2. Token extracted from URL parameters
3. API call to `/api/auth/verify-email`
4. Account marked as verified
5. User can now login

### 3. Login
1. User enters email and password
2. API call to `/api/auth/login`
3. JWT token received and stored
4. User redirected to home page
5. Navigation shows user info and logout button

### 4. Google OAuth
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google redirects back to `/auth/callback`
4. Token received and stored
5. User authenticated and redirected

## API Integration

The frontend communicates with the backend through the `api.ts` service:

```typescript
// Authentication API functions
authAPI.register(userData)     // Register new user
authAPI.verifyEmail(token)     // Verify email with token
authAPI.login(credentials)     // Login user
authAPI.getCurrentUser()       // Get current user data
authAPI.getGoogleAuthUrl()     // Get Google OAuth URL

// Authentication utilities
authUtils.setAuth(token, user) // Store auth data
authUtils.getToken()           // Get stored token
authUtils.getUser()            // Get user data
authUtils.isAuthenticated()    // Check if authenticated
authUtils.logout()             // Clear auth data
```

## Components

### Navigation
- Responsive navigation bar
- Shows auth buttons when not logged in
- Shows user info and logout when authenticated
- Smooth scroll-based visibility

### ProtectedRoute
- Wraps routes that require authentication
- Checks JWT token validity
- Redirects to login if not authenticated
- Shows loading spinner during auth check

### Login/Register Forms
- Beautiful glass morphism design
- Real-time validation
- Loading states and error handling
- Google OAuth integration

## Styling

The app uses Tailwind CSS with custom utilities:

- **Glass morphism effects** with backdrop blur
- **Gradient backgrounds** and buttons
- **Smooth transitions** and animations
- **Responsive design** for all screen sizes
- **Dark mode support** built-in

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Update environment variables** for production

## Troubleshooting

### Common Issues

1. **API Connection Failed:**
   - Check backend server is running
   - Verify `VITE_API_URL` is correct
   - Check CORS configuration

2. **Authentication Not Working:**
   - Verify JWT token is being sent
   - Check localStorage for auth data
   - Ensure backend routes are accessible

3. **Google OAuth Issues:**
   - Verify Google OAuth credentials
   - Check redirect URI configuration
   - Ensure backend OAuth routes are working

## Contributing

1. Follow TypeScript best practices
2. Use meaningful component and variable names
3. Add proper error handling
4. Test authentication flows thoroughly
5. Maintain responsive design

## License

ISC 