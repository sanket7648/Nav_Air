import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token found. Please check your email for the correct verification link.');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#181f3a] to-[#181f3a] overflow-hidden">
      <div className="relative w-full max-w-sm mx-auto p-6 rounded-2xl shadow-glass bg-white/90 dark:bg-neutral-900/90 border border-white/30 dark:border-neutral-800 backdrop-blur-lg">
        {/* Decorative Orbs */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-fuchsia-400/30 to-pink-400/10 rounded-full blur-xl pointer-events-none"></div>
        
        {/* Content */}
        <div className="flex flex-col items-center text-center relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>

          {/* Message */}
          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6">
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {/* Action Buttons */}
          {status === 'success' && (
            <Link
              to="/login"
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition mb-3"
            >
              Continue to Login
            </Link>
          )}

          {status === 'error' && (
            <div className="space-y-3 w-full">
              <Link
                to="/register"
                className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition block text-center"
              >
                Try Registering Again
              </Link>
              <Link
                to="/login"
                className="w-full py-2 px-4 rounded-lg border border-gray-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 transition block text-center"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Back to Home */}
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}; 