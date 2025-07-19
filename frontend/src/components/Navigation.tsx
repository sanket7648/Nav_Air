import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Navigation as NavigationIcon, 
  Package, 
  Plane, 
  AlertCircle, 
  Calendar, 
  Palette,
  ArrowLeft,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NavAirLogo from '../assets/NavAir.jpg';

// Navigation data
const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/navigation', icon: NavigationIcon, label: 'Navigate' },
  { path: '/baggage', icon: Package, label: 'Baggage' },
  { path: '/flights', icon: Plane, label: 'Flights' },
  { path: '/emergency', icon: AlertCircle, label: 'Emergency' },
  { path: '/booking', icon: Calendar, label: 'Booking' },
  { path: '/art', icon: Palette, label: 'Art' },
];

// User Profile Dropdown Component
const UserProfileDropdown: React.FC<{ user: any; onLogout: () => void }> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.email)}&background=3B82F6&color=fff&size=150`;
  const displayName = user.name || user.username || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
        <span className="hidden sm:inline text-sm font-medium text-gray-700">{displayName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-gray-900">{displayName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 mt-3 pt-3">
                <button 
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden justify-around py-2 shadow-lg">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <a
            href={item.path}
            key={item.path}
            className={`flex flex-col items-center text-xs font-medium px-2 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
          >
            <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};

// Main Navigation Component
export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(true);


  const isAuthPage = ['/login', '/register', '/verify-email', '/auth/callback', '/otp-verify', '/otp-success', '/forgot-password', '/reset-password'].includes(location.pathname);

  // Disable auto-scroll behavior - navbar always visible
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Render back button for auth pages
  if (isAuthPage) {
    return (
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/50 hover:bg-gray-100 transition shadow"
        aria-label="Back to Home"
      >
        <ArrowLeft className="w-6 h-6 text-blue-600" />
      </button>
    );
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 backdrop-blur-md border-b border-blue-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <img src={NavAirLogo} alt="NavAir" className="w-14 h-14 object-cover" />
              <span className="text-xl font-bold text-white">NavAir</span>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <a
                    href={item.path}
                    key={item.path}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 no-underline hover:no-underline focus:no-underline ${
                      isActive 
                        ? 'text-white bg-white/20 shadow-lg' 
                        : 'text-white/90 hover:bg-white/10 hover:shadow-md'
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        layoutId="active-link"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Right Side - Auth/User */}
            <div className="flex items-center space-x-4">

            {/* Search Button */}
            <button className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-lg">
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}

            <button className="p-2 text-white/90 hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

              {/* User Profile or Auth Buttons */}
              {isAuthenticated && user ? (
                <UserProfileDropdown user={user} onLogout={handleLogout} />
              ) : (
                <div className="flex items-center space-x-2">
                  <a href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:border-white/50 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl no-underline hover:no-underline focus:no-underline" style={{ textDecoration: 'none' }}>
                    Sign In
                  </a>
                  <a href="/register" className="px-4 py-2 text-sm font-semibold text-white bg-purple-600/80 backdrop-blur-sm border border-purple-400/50 hover:bg-purple-700/90 hover:border-purple-300/70 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl no-underline hover:no-underline focus:no-underline" style={{ textDecoration: 'none' }}>
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>



      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
};
