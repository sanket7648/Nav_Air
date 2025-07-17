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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-[#181f2a] flex flex-col items-center">
        <div className="flex flex-col items-center text-center relative z-10 w-full">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-2">
            Email Verified Successfully!
          </h2>
          {/* Message */}
          <p className="text-neutral-300 text-sm mb-6">
            Redirecting to login page...
          </p>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default OtpSuccessPage; 