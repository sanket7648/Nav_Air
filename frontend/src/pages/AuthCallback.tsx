import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authUtils } from '../services/api';

export const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const success = searchParams.get('success');
      const errorMessage = searchParams.get('message');

      if (success === 'true' && token) {
        try {
          // Store the token (user data will be fetched later)
          authUtils.setAuth(token, {});
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } catch (error) {
          setStatus('error');
          setMessage('Failed to complete authentication.');
        }
      } else {
        setStatus('error');
        setMessage(errorMessage || 'Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

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
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
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
            {status === 'loading' && 'Completing Authentication...'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </h2>

          {/* Message */}
          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6">
            {status === 'loading' && 'Please wait while we complete your authentication...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {/* Action Buttons */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold text-sm shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 