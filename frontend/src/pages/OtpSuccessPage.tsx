import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

const OtpSuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          {/* Title */}
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
            Email Verified Successfully!
          </h2>
          {/* Message */}
          <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6">
            Redirecting to login page...
          </p>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default OtpSuccessPage; 