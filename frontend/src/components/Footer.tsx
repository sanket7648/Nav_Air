import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white w-full mt-auto relative overflow-hidden">
    {/* Animated SVG pattern at the top of the footer */}
    <div className="absolute -top-10 left-0 w-full h-20 pointer-events-none select-none z-0">
      <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path fill="url(#footer-wave)" fillOpacity="1" d="M0,64L48,58.7C96,53,192,43,288,53.3C384,64,480,96,576,101.3C672,107,768,85,864,74.7C960,64,1056,64,1152,69.3C1248,75,1344,85,1392,90.7L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        <defs>
          <linearGradient id="footer-wave" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#a21caf" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">About NavAir</h3>
          <p className="text-sm text-gray-300 leading-relaxed">NavAir is a premier enterprise solution dedicated to revolutionizing the airport experience through cutting-edge AI and real-time data integration.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#" className="hover:text-white transition-colors duration-200">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Use</a></li>
            <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 text-white">Contact</h3>
          <p className="text-sm text-gray-300">navair.services@gmail.com</p>
          <p className="text-sm text-gray-300">+919667093725</p>
        </div>
      </div>
      {/* Copyright Section */}
      <div className="border-t border-gray-700 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-400">
            © 2025 NavAir. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Built with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <span className="text-blue-400 font-semibold">NityaVira</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer; 