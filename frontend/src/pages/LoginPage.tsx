import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../services/api';

const LoginPage: React.FC = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        authUtils.setAuth(data.token, data.user);
        navigate('/');
      } else {
        setLoginError(data.message || 'Login failed.');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setForgotError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMessage('If that email is registered, a reset link has been sent.');
      } else {
        setForgotError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setForgotError('Network error. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    // FIX 1: This container now perfectly centers the card and prevents any scrolling on the page.
    <div className="flex items-center justify-center bg-gradient-to-br from-[#181f2a] to-[#232946] min-h-screen overflow-hidden p-4">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-[#181f2a]">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-400 flex items-center justify-center mb-2 shadow-lg">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 2a1 1 0 0 1 .993.883L13 3v1.07a7.001 7.001 0 0 1 6.928 6.13l.014.2a1 1 0 0 1-1.993.117l-.014-.117A5.001 5.001 0 0 0 13 4.07V5a1 1 0 0 1-1.993.117L11 5V4.07A7.001 7.001 0 0 1 4.072 10.2a1 1 0 0 1-1.993-.117l.014-.2A7.001 7.001 0 0 1 11 4.07V3a1 1 0 0 1 1-1Z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-sm">Sign in to your NavAir account</p>
        </div>

        {/* FIX 2: Switched to conditional rendering. Only one form exists at a time, so the card height is always correct. */}
        {showForgotPassword ? (
          // Forgot Password Form
          <div>
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
              <input
                  id="forgot-email" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required autoFocus
                />
              </div>
              <button
                type="submit" disabled={forgotLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-60 text-base"
              >
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {forgotMessage && <div className="mt-3 text-green-400 text-center text-xs">{forgotMessage}</div>}
            {forgotError && <div className="mt-3 text-red-400 text-center text-xs">{forgotError}</div>}
            <div className="mt-4 text-center">
              <button className="text-blue-400 hover:underline text-xs" onClick={() => setShowForgotPassword(false)}>
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          // Login Form
          <div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
                <input
                  id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  required autoFocus
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-300 mb-1">Password</label>
              <input
                  id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              />
              </div>
              {loginError && <div className="text-red-400 text-center text-xs">{loginError}</div>}
              <button
                type="submit" disabled={loginLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-200 text-base"
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            <div className="my-4 flex items-center justify-center">
              <span className="h-px w-16 bg-gray-700" /><span className="mx-3 text-gray-400 text-xs">or</span><span className="h-px w-16 bg-gray-700" />
            </div>
            <button onClick={() => window.location.href = '/api/auth/google'} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-200 mb-4 text-sm">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <div className="text-center text-gray-400 text-xs">
              Don't have an account? <span className="text-blue-400 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Sign up here</span>
            </div>
            <div className="mt-3 text-center">
              <button className="text-blue-400 hover:underline text-xs" onClick={() => setShowForgotPassword(true)}>
                Forgot Password?
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;