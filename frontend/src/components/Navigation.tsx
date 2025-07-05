import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Navigation as NavigationIcon, 
  Package, 
  Plane, 
  AlertCircle, 
  Calendar, 
  Palette,
  Zap,
  ArrowLeft,
  LogOut,
  User
} from 'lucide-react';
import { authUtils } from '../services/api';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-email' || location.pathname === '/auth/callback';

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authUtils.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const userData = authUtils.getUser();
        setUser(userData);
      }
    };

    checkAuth();
    // Check auth on route changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [location]);

  useEffect(() => {
    if (isAuthPage) return;
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) setIsVisible(true);
      else if (currentScrollY < lastScrollY) setIsVisible(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 100) setIsVisible(false);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, isAuthPage]);

  if (isAuthPage) {
    return (
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-transparent hover:bg-gray-100 transition"
        aria-label="Back to Home"
        style={{ boxShadow: 'none', border: 'none', background: 'none' }}
      >
        <ArrowLeft className="w-7 h-7 text-blue-600" />
      </button>
    );
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Home', color: 'from-blue-500 to-cyan-500' },
    { path: '/navigation', icon: NavigationIcon, label: 'Navigate', color: 'from-emerald-500 to-teal-500' },
    { path: '/baggage', icon: Package, label: 'Baggage', color: 'from-orange-500 to-amber-500' },
    { path: '/flights', icon: Plane, label: 'Flights', color: 'from-purple-500 to-violet-500' },
    { path: '/emergency', icon: AlertCircle, label: 'Emergency', color: 'from-red-500 to-rose-500' },
    { path: '/booking', icon: Calendar, label: 'Booking', color: 'from-indigo-500 to-blue-500' },
    { path: '/art', icon: Palette, label: 'Art', color: 'from-pink-500 to-fuchsia-500' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="px-5 py-2.5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-9 h-9 gradient-mesh-blue rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient leading-tight">NavAir</h1>
              <p className="text-xs font-medium text-neutral-600">Intelligent Navigation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.username || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    authUtils.logout();
                    navigate('/login');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold shadow hover:from-blue-600 hover:to-fuchsia-600 transition"
                >
                  Register
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-1.5 rounded-lg bg-white border border-blue-500 text-blue-600 font-semibold shadow hover:bg-blue-50 transition"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-5 pb-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'bg-gray-100 text-neutral-800 shadow-sm'
                    : 'text-neutral-600 hover:bg-gray-50 hover:text-neutral-800'
                }`}
              >
                <div className={`relative p-1 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${item.color} shadow-md` 
                    : 'bg-neutral-100 group-hover:bg-neutral-200'
                }`}>
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-neutral-600'
                  }`} />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-1 h-1 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};