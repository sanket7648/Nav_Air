import React, { useState, useRef } from 'react';
import { Key, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const OtpVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setError('');
    // Move to next input if value entered
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
    // Move to previous input if deleted
    if (!value && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      setIsLoading(false);
      return;
    }
    try {
      await authAPI.verifyOtp({ otp: otpValue });
      navigate('/otp-success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0a1124] via-[#181f3a] to-[#181f3a] overflow-hidden">
      <div className="relative w-full max-w-sm mx-auto p-4 rounded-2xl shadow-glass bg-white/90 dark:bg-neutral-900/90 border border-white/30 dark:border-neutral-800 backdrop-blur-lg">
        {/* Decorative Orbs */}
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-fuchsia-400/30 to-pink-400/10 rounded-full blur-xl pointer-events-none"></div>
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-4 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-glow mb-2">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Enter Your OTP</h2>
        </div>
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm relative z-10">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="flex justify-center gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e, idx)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-2xl font-bold rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                disabled={isLoading}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold text-base shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPage; 