// sanket7648/nav_air/Nav_Air-829cba947a0fef3ed62fd6d062b82f00dfe48634/frontend/src/components/SignInPopup.tsx
import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignInPopupProps {
  onClose: () => void;
}

const SignInPopup: React.FC<SignInPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm w-full text-center">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
        <p className="text-gray-600 mb-6">You need to be signed in to access this feature.</p>
        <Link
          to="/login"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default SignInPopup;