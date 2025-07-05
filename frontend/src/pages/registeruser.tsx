import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, Globe, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const countries = [
  'India', 'United States', 'United Kingdom', 'Canada', 'China', 'France',
  'Germany', 'Japan', 'Australia', 'Brazil', 'South Africa', 'Other',
];

export const RegisterUser: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([]);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    contact_number: '',
    country: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsLoading(true);

    try {
      const response = await authAPI.register(form);
      setSuccess(true);
    } catch (error: any) {
      // Check for validation errors from backend
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else {
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#181f3a] to-[#181f3a] overflow-hidden">
      <div className="relative w-full max-w-lg mx-auto p-3 rounded-xl shadow-glass bg-white/90 dark:bg-neutral-900/90 border border-white/30 dark:border-neutral-800 backdrop-blur-lg">
        {/* Decorative Orbs */}
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur pointer-events-none"></div>
        <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-gradient-to-br from-fuchsia-400/30 to-pink-400/10 rounded-full blur pointer-events-none"></div>
        
        {/* Logo & Welcome */}
        <div className="flex flex-col items-center mb-2 relative z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-glow mb-1">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-0.5">Create Account</h2>
          <p className="text-neutral-500 dark:text-neutral-300 text-[11px]">Register for your NavAir experience</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm relative z-10">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Registration successful! Please check your email to verify your account.</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {fieldErrors.length > 0 && (
          <ul className="error-list">
            {fieldErrors.map((err, idx) => (
              <li key={idx} className="text-red-600 text-xs">
                {err.field}: {err.message}
              </li>
            ))}
          </ul>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-2 relative z-10">
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-200 mb-0.5" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-3.5 h-3.5" />
              <input
                id="username"
                name="username"
                type="text"
                required
                disabled={isLoading || success}
                value={form.username}
                onChange={handleChange}
                className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                placeholder="Choose a username"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-200 mb-0.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-3.5 h-3.5" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="you@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-200 mb-0.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-3.5 h-3.5" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                className="w-full pl-7 pr-7 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Create a password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-300 hover:text-blue-500"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-200 mb-0.5" htmlFor="contact_number">
              Contact Number
            </label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-3.5 h-3.5" />
              <input
                id="contact_number"
                name="contact_number"
                type="tel"
                required
                disabled={isLoading || success}
                value={form.contact_number}
                onChange={handleChange}
                className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
                placeholder="Your contact number"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-200 mb-0.5" htmlFor="country">
              Country
            </label>
            <div className="relative">
              <Globe className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-300 w-3.5 h-3.5" />
              <select
                id="country"
                name="country"
                required
                disabled={isLoading || success}
                value={form.country}
                onChange={handleChange}
                className="w-full pl-7 pr-2 py-1.5 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-50"
              >
                <option value="" disabled>Select country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-1.5 rounded bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold text-sm shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-4 relative z-10">
          <p className="text-neutral-500 dark:text-neutral-400 text-xs">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-600 font-medium transition"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}