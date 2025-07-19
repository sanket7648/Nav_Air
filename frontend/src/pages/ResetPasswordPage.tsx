import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import NavAirLogo from '../assets/NavAir.jpg';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Your Password has been changed successfully');
        setTimeout(() => {
          setRedirecting(true);
          setTimeout(() => navigate('/login'), 2000);
        }, 1500);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181f2a] to-[#232946] overflow-hidden relative">
      {/* Only show the green box after success, no outer card */}
      {message ? (
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-green-400/10 to-green-900/40 border-2 border-green-400 rounded-3xl p-10 shadow-2xl animate-fade-in max-w-lg w-full">
          <CheckCircle className="w-16 h-16 text-green-400 mb-4 animate-pulse" />
          <div className="text-2xl font-extrabold text-green-300 mb-2 text-center" style={{letterSpacing: '0.5px'}}>Your Password has been changed successfully</div>
          <div className="text-green-200 text-base mb-4 text-center">You can now log in with your new password.</div>
          <div className="flex flex-col items-center mt-2">
            <div className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-pulse">Redirecting to login page...</div>
            <svg className="animate-spin h-12 w-12 text-blue-400 drop-shadow-lg" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-[#181f2a] relative transition-all duration-500">
          <div className="flex flex-col items-center mb-6">
            <img src={NavAirLogo} alt="NavAir" className="w-16 h-16 object-cover mb-2" />
            <h2 className="text-3xl font-bold text-white mb-1">Reset Password</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-4 py-2 border border-gray-700 bg-[#232946] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error && <div className="mt-2 text-red-400 text-center text-xs">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition duration-200"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage; 