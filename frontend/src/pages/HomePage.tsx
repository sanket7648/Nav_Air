import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Navigation, 
  Package, 
  Plane, 
  AlertCircle, 
  Calendar, 
  Palette,
  Clock,
  MapPin,
  Bell,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Star,
  Wifi,
  Battery,
  Sparkles,
  Target,
  Shield,
  Brain,
  Compass
} from 'lucide-react';
import UsernameDisplay from '../components/UsernameDisplay';

export const HomePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel] = useState(87);
  const [flightProgress, setFlightProgress] = useState(0);

  // Get user from localStorage (or use your auth context/provider)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const displayName = user?.name || user?.fullName || "Anonymous User";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setFlightProgress(prev => (prev + 0.5) % 100);
    }, 100);
    return () => clearInterval(progressTimer);
  }, []);

  const features = [
    {
      icon: Navigation,
      title: 'Smart Navigation',
      description: 'AI-powered route optimization',
      link: '/navigation',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
      stats: '2.3k users',
      trend: '+12%',
      badge: 'AI'
    },
    {
      icon: Package,
      title: 'Baggage Intelligence',
      description: 'Real-time tracking & predictions',
      link: '/baggage',
      gradient: 'from-orange-400 via-amber-500 to-yellow-600',
      stats: '1.8k tracked',
      trend: '+8%',
      badge: 'LIVE'
    },
    {
      icon: Plane,
      title: 'Flight Insights',
      description: 'Predictive delay analysis',
      link: '/flights',
      gradient: 'from-purple-400 via-violet-500 to-indigo-600',
      stats: '94% accuracy',
      trend: '+5%',
      badge: 'PRO'
    },
    {
      icon: AlertCircle,
      title: 'Emergency Hub',
      description: 'Instant assistance network',
      link: '/emergency',
      gradient: 'from-red-400 via-rose-500 to-pink-600',
      stats: '<30s response',
      trend: 'optimal',
      badge: 'SOS'
    },
    {
      icon: Calendar,
      title: 'Smart Booking',
      description: 'Optimal time slot prediction',
      link: '/booking',
      gradient: 'from-blue-400 via-indigo-500 to-purple-600',
      stats: '2.1k slots',
      trend: '+15%',
      badge: 'NEW'
    },
    {
      icon: Palette,
      title: 'Cultural Discovery',
      description: 'AR-enhanced art exploration',
      link: '/art',
      gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
      stats: '47 exhibits',
      trend: 'new',
      badge: 'AR'
    },
  ];

  const alerts = [
    {
      icon: Clock,
      title: 'Gate Update',
      message: 'UA123 → Gate B7 (Changed 5min ago)',
      type: 'warning',
      time: '2m ago',
      priority: 'high'
    },
    {
      icon: Package,
      title: 'Baggage Alert',
      message: 'Your luggage arrived at Carousel 3',
      type: 'success',
      time: '8m ago',
      priority: 'medium'
    },
  ];

  const quickStats = [
    { label: 'On-Time Rate', value: '94.2%', change: '+2.1%', positive: true, icon: Target },
    { label: 'Avg Security Wait', value: '8min', change: '-3min', positive: true, icon: Shield },
    { label: 'Active Passengers', value: '12.4k', change: '+1.2k', positive: true, icon: Users },
  ];

  const aiInsights = [
    { text: 'Best time to arrive: 2 hours early', confidence: 95 },
    { text: 'Security wait time: 8-12 minutes', confidence: 88 },
    { text: 'Gate B12 has food options nearby', confidence: 92 },
  ];

  return (
    <div className="pt-28 px-6 pb-8 min-h-screen bg-gradient-to-br from-neutral-50 via-blue-50/30 to-purple-50/20">
      
      {/* Enhanced Hero Section */}
      <div className="mb-8 mt-6">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #3b4371 0%, #232946 100%)"
          }}
        >
          {/* Vibrant Floating Bubbles */}
          <div className="absolute top-10 left-20 w-32 h-32 bg-blue-400/40 rounded-full blur-2xl animate-pulse z-0"></div>
          <div className="absolute top-1/4 right-24 w-24 h-24 bg-fuchsia-400/40 rounded-full blur-2xl animate-pulse z-0"></div>
          <div className="absolute bottom-10 left-1/2 w-28 h-28 bg-cyan-400/40 rounded-full blur-2xl animate-pulse z-0"></div>
          <div className="absolute bottom-16 right-16 w-36 h-36 bg-purple-400/40 rounded-full blur-2xl animate-pulse z-0"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-yellow-300/40 rounded-full blur-2xl animate-pulse z-0"></div>
          {/* You can add/remove bubbles as you like */}

          {/* Main Content */}
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-start justify-between mb-8">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-glow">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold mb-1">Welcome!</h2>
                    <p className="text-2xl font-semibold text-gradient-gold">
                      <UsernameDisplay />
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="text-blue-100 text-lg font-medium flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Your AI travel assistant is ready</span>
                  </p>
                  <p className="text-blue-200 text-sm">Next flight in 2h 15m • Everything is on track</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="glass-dark rounded-2xl p-4">
                  <div className="text-sm text-blue-200 mb-1">Flight Status</div>
                  <div className="text-2xl font-bold mb-2">UA123</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-300 font-medium">On Time</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Static Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-dark rounded-2xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-100">Current Location</div>
                    <div className="text-xs text-blue-300">Live tracking</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-1">Terminal 3, Level 2</div>
                <div className="text-sm text-blue-200">Security Checkpoint A</div>
                <div className="mt-3 flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-accent-400" />
                  <span className="text-xs text-accent-300 font-medium">Optimal path calculated</span>
                </div>
              </div>
              
              <div className="glass-dark rounded-2xl p-5">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                    <Plane className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-100">Departure Gate</div>
                    <div className="text-xs text-blue-300">8 min walk</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-1">Gate B12</div>
                <div className="text-sm text-blue-200">Boarding starts 14:00</div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-blue-300 mb-1">
                    <span>Walking progress</span>
                    <span>{Math.round(flightProgress)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-300"
                      style={{ width: `${flightProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI Insights */}
            <div className="glass-dark rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-5 h-5 text-accent-400" />
                <span className="text-sm font-semibold text-blue-100">AI Travel Insights</span>
                <div className="px-2 py-1 bg-accent-400/20 text-accent-300 text-xs font-bold rounded-full">LIVE</div>
              </div>
              <div className="space-y-2">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-blue-200">{insight.text}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-300 font-medium">{insight.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-neutral-800">Live Updates</h3>
            <div className="flex items-center space-x-1 text-sm text-neutral-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Real-time</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const Icon = alert.icon;
              return (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] card-hover ${
                    alert.type === 'warning' 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200' 
                      : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="flex items-start space-x-4 relative z-10">
                    <div className={`p-3 rounded-xl ${
                      alert.type === 'warning' 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                        : 'bg-gradient-to-br from-emerald-400 to-green-500'
                    } shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-neutral-800">{alert.title}</h4>
                        <div className="flex items-center space-x-2">
                          {alert.priority === 'high' && (
                            <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                              HIGH
                            </div>
                          )}
                          <span className="text-xs text-neutral-500">{alert.time}</span>
                        </div>
                      </div>
                      <p className="text-neutral-600 font-medium">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-800">Smart Services</h3>
          <div className="flex items-center space-x-1 text-sm text-neutral-500">
            <Zap className="w-4 h-4" />
            <span>AI-Powered</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.link}
                to={feature.link}
                className="group relative"
              >
                <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-glass border border-white/20 transition-all duration-500 hover:shadow-glow card-hover">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 text-xs font-bold rounded-full ${
                          feature.badge === 'AI' ? 'bg-purple-100 text-purple-700' :
                          feature.badge === 'LIVE' ? 'bg-green-100 text-green-700' :
                          feature.badge === 'NEW' ? 'bg-blue-100 text-blue-700' :
                          feature.badge === 'AR' ? 'bg-pink-100 text-pink-700' :
                          feature.badge === 'SOS' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {feature.badge}
                        </div>
                        <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-neutral-800 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-neutral-500">
                        {feature.stats}
                      </div>
                      <div className={`flex items-center space-x-1 text-xs font-semibold ${
                        feature.trend === 'new' ? 'text-purple-600' : 'text-green-600'
                      }`}>
                        {feature.trend !== 'new' && feature.trend !== 'optimal' && (
                          <TrendingUp className="w-3 h-3" />
                        )}
                        {feature.trend === 'new' && <Star className="w-3 h-3" />}
                        <span>{feature.trend}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Enhanced Airport Analytics */}
      <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-800">Airport Pulse</h3>
          <div className="flex items-center space-x-1 text-sm text-neutral-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Live Analytics</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="relative overflow-hidden text-center p-5 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-neutral-800 mb-1">{stat.value}</div>
                  <div className="text-sm text-neutral-600 mb-2">{stat.label}</div>
                  <div className={`text-xs font-semibold flex items-center justify-center space-x-1 ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-3 h-3 ${!stat.positive && 'rotate-180'}`} />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};