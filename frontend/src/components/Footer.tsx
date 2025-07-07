import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => (
  <footer className="w-full py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center shadow-inner">
    <div className="flex items-center gap-2 text-lg font-semibold">
      Developed by <span className="font-bold mx-1 text-fuchsia-400">NityaVira</span>
      <Heart className="w-5 h-5 text-pink-400 animate-pulse" fill="#f472b6" />
      <span className="ml-1">with Love</span>
    </div>
  </footer>
);

export default Footer; 