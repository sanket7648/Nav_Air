import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, authUtils } from '../services/api';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(form);
      authUtils.setAuth(response.token, response.user);
      localStorage.setItem('token', response.token);

      // Fetch user profile from /api/auth/me
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${response.token}` }
      });
      const meData = await meRes.json();
      if (meData && meData.user) {
        localStorage.setItem('user', JSON.stringify(meData.user));
        console.log("Saved user to localStorage:", meData.user);
      } else {
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log("Saved fallback user to localStorage:", response.user);
      }

      navigate('/', { replace: true });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.getGoogleAuthUrl();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#181f3a] to-[#181f3a] overflow-hidden">
      <div className="relative w-full max-w-sm mx-auto p-4 rounded-2xl shadow-glass bg-white/90 dark:bg-neutral-900/90 border border-white/30 dark:border-neutral-800 backdrop-blur-lg">
        {/* Decorative Orbs */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-fuchsia-400/30 to-pink-400/10 rounded-full blur-xl pointer-events-none"></div>
        
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-4 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-glow mb-2">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Welcome Back</h2>
          <p className="text-neutral-500 dark:text-neutral-300 text-xs">Sign in to your NavAir account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-4 h-4" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={form.email}
                onChange={handleChange}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-200 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-4 h-4" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={form.password}
                onChange={handleChange}
                className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                placeholder="Your password"
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-300 hover:text-blue-500 disabled:opacity-50"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold text-base shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4 relative z-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent"></div>
          <span className="mx-2 text-neutral-400 dark:text-neutral-500 text-xs">or</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-neutral-200 dark:via-neutral-700 to-transparent"></div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 32.9 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.7 0-14.2 4.6-17.7 11.7z"/>
              <path fill="#FBBC05" d="M24 44c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 35.2 27 36 24 36c-5.8 0-10.7-3.9-12.5-9.1l-7 5.4C9.8 41.4 16.3 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2c2.1 0 4 .8 5.5 2.1l6.4-6.4C34.1 5.1 29.3 3 24 3c-7.7 0-14.2 4.6-17.7 11.7l7 5.1C15.1 17.1 19.2 14 24 14c2.7 0 5.2.9 7.2 2.5l6.4-6.4C34.1 5.1 29.3 3 24 3z"/>
            </g>
          </svg>
          Sign in with Google
        </button>

        {/* Register Link */}
        <div className="text-center mt-4 relative z-10">
          <p className="text-neutral-500 dark:text-neutral-400 text-xs">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-500 hover:text-blue-600 font-medium transition"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}