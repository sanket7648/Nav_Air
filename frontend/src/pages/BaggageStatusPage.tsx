import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Search,
  Clock,
  Plane,
  Shield,
  Camera,
  TrendingUp,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { baggageAPI, authUtils } from '../services/api';
import Footer from '../components/Footer';

// --- Floating Baggage Animation Component ---
const FloatingBaggage: React.FC = () => {
  const [bags, setBags] = useState<any[]>([]);

  useEffect(() => {
    const numBags = 15;
    const newBags = Array.from({ length: numBags }).map(() => ({
      id: Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      size: Math.random() * 20 + 20,
      opacity: Math.random() * 0.3 + 0.1,
      color: `hsl(${Math.random() * 30 + 200}, 60%, 60%)`,
    }));
    setBags(newBags);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setBags(prevBags =>
        prevBags.map(bag => {
          let { x, y, vx, vy } = bag;
          x += vx;
          y += vy;
          if (x <= -5 || x >= 105) vx *= -1;
          if (y <= -5 || y >= 105) vy *= -1;
          return { ...bag, x, y, vx, vy };
        })
      );
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bags.map(bag => (
        <Package
          key={bag.id}
          className="absolute"
          style={{
            left: `${bag.x}%`,
            top: `${bag.y}%`,
            width: `${bag.size}px`,
            height: `${bag.size}px`,
            opacity: bag.opacity,
            color: bag.color,
            transition: 'left 0.1s linear, top 0.1s linear',
          }}
        />
      ))}
    </div>
  );
};


const STATUS_STEPS = [
  { key: 'Checked In', title: 'Checked In', icon: CheckCircle, description: 'Bag received and tagged at check-in counter', color: 'from-blue-500 to-blue-600' },
  { key: 'Security Cleared', title: 'Security Cleared', icon: Shield, description: 'Successfully passed security screening', color: 'from-green-500 to-green-600' },
  { key: 'Loaded on Aircraft', title: 'Loaded on Aircraft', icon: Plane, description: 'Loaded onto aircraft', color: 'from-purple-500 to-purple-600' },
  { key: 'In Transit', title: 'In Transit', icon: Truck, description: 'Being transported to baggage claim area', color: 'from-orange-500 to-orange-600' },
  { key: 'At Carousel', title: 'At Carousel', icon: MapPin, description: 'Available for pickup at designated carousel', color: 'from-emerald-500 to-emerald-600' },
  { key: 'Ready for Pickup', title: 'Ready for Pickup', icon: MapPin, description: 'Your bag is ready for pickup', color: 'from-emerald-500 to-green-600' },
];

function timeAgo(timestamp: number) {
  const diff = Math.floor((Date.now() - timestamp) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return `${diff} min ago`;
}

export const BaggageStatusPage: React.FC = () => {
  const [searchTag, setSearchTag] = useState('');
  const [bag, setBag] = useState<any | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ bagId: '', flightNumber: '', carouselNumber: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);
  const [dummyStep, setDummyStep] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const isAuthenticated = authUtils.isAuthenticated();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dummy data animation for unauthenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        setDummyStep((prev) => (prev + 1) % STATUS_STEPS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!bag) return;
    const interval = setInterval(() => {
      setIsRefreshing(true);
      handleSearch();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [bag]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setBag(null);
    if (!searchTag) {
      setError('Please enter a baggage tag number.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await baggageAPI.get(searchTag);
      setBag(data);
    } catch (err) {
      setError('Baggage not found or an error occurred.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    setCreateError('');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess(false);
    try {
      await baggageAPI.create({
        bagId: createForm.bagId || undefined,
        flightNumber: createForm.flightNumber,
        carouselNumber: Number(createForm.carouselNumber),
      });
      setCreateSuccess(true);
      setCreateForm({ bagId: '', flightNumber: '', carouselNumber: '' });
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateForm(false);
      }, 2000);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create record.');
    } finally {
      setCreateLoading(false);
    }
  };

  const currentStepIdx = bag ? STATUS_STEPS.findIndex(step => step.key === bag.currentStatus) : -1;

  return (
    <>
      {/* This new div creates a fixed background layer for the entire page */}
      <div className="fixed inset-0 bg-gradient-to-br from-yellow-50 to-orange-100 -z-10" />
      
      {/* The original container now just handles content layout, without its own background */}
      <div className="flex flex-col items-center py-6 sm:py-12 px-2 sm:px-0 pt-[100px] sm:pt-[100px] md:pb-[200px]">
        <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-4 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-600/20 to-yellow-600/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-2xl font-bold mb-1">Baggage Intelligence</h2>
                    <p className="text-orange-100 text-base">Real-time tracking & predictions</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${realTimeUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium">Live Tracking</span>
                  </div>
                    {bag && (
                      <div className="text-xs text-orange-200">
                        Last update: {timeAgo(bag.lastTimestamp)}
                      </div>
                    )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-dark rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="w-5 h-5 text-accent-400" />
                    <span className="text-sm font-medium text-orange-100">Active Bags</span>
                  </div>
                    <div className="text-2xl font-bold">{bag ? 1 : 0}</div>
                  <div className="text-sm text-orange-200">Being tracked</div>
                </div>
                
                <div className="glass-dark rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                    <span className="text-sm font-medium text-orange-100">Accuracy</span>
                  </div>
                    <div className="text-2xl font-bold">{bag ? Math.round(bag.confidence * 100) : 0}%</div>
                  <div className="text-sm text-orange-200">Prediction confidence</div>
                </div>
              </div>
            </div>
          </div>
        </div>

          {isAuthenticated ? (
            <>
              {/* Search and Create Section for Authenticated Users */}
              <div className="mb-6 flex items-start gap-4">
                <form onSubmit={handleSearch} className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
                  placeholder="Enter baggage tag number (e.g., DEL12345)"
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
                  className="pl-12 pr-32 py-3 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-glass text-base font-medium transition-all duration-300 w-full"
          />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md hover:from-orange-600 hover:to-amber-700 transition-all text-base disabled:opacity-50"
                  >
                    {isLoading ? 'Searching...' : <><Search className="w-5 h-5" /> Search</>}
                  </button>
                </form>
            <button
                  type="button"
                  onClick={() => {
                    setIsRefreshing(true);
                    handleSearch();
                  }}
                  className="ml-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none"
                  aria-label="Refresh status"
            >
                  <svg
                    className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582M20 20v-5h-.581M5.582 9A7.978 7.978 0 014 12c0 4.418 3.582 8 8 8a7.978 7.978 0 007.418-5M18.418 15A7.978 7.978 0 0020 12c0-4.418-3.582-8-8-8a7.978 7.978 0 00-7.418 5"
                    />
                  </svg>
            </button>
            <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition-all text-base"
            >
                  <Sparkles className="w-5 h-5" />
                  Create Record
            </button>
          </div>
          
              {error && <div className="text-center text-red-600 p-4 bg-red-100 rounded-2xl mb-6">{error}</div>}
              
              {bag && (
                  <>
                    <div className="mb-6">
                      <div className="relative overflow-hidden rounded-2xl p-6 border bg-white shadow-glass">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                                <Package className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                <h4 className="font-bold text-neutral-800 text-lg">{bag.bagId}</h4>
                                <div className="flex items-center space-x-3 text-sm text-neutral-600">
                                    <span className="font-medium">Flight {bag.flightNumber}</span>
                                    <span>•</span>
                                    <span className="font-medium">Carousel {bag.carouselNumber}</span>
                                </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg mb-2`}>
                                {bag.currentStatus}
                                </div>
                                <div className="text-sm text-neutral-600">
                                <div className="font-semibold">{Math.round((currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}% Complete</div>
                                </div>
                            </div>
                          </div>
                          <div className="mt-4">
                          <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                              <span>Progress</span>
                              <span>{Math.round((currentStepIdx / (STATUS_STEPS.length - 1)) * 100)}% Complete</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                              style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                              ></div>
                          </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                          Confidence: <b>{Math.round(bag.confidence * 100)}%</b> &nbsp;|&nbsp; Last seen: {timeAgo(bag.lastTimestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                          <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/20">
                              <div className="flex items-center justify-between mb-6">
                              <h3 className="text-xl font-bold text-neutral-800">
                                  Tracking Details: {bag.bagId}
                              </h3>
                              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                                  <Camera className="w-4 h-4" />
                                  <span>AI-Powered Tracking</span>
                              </div>
                              </div>
                              <div className="space-y-6">
                              {STATUS_STEPS.map((step, index) => {
                                  const Icon = step.icon;
                                  const isCompleted = currentStepIdx >= index;
                                  const isCurrent = currentStepIdx === index;
          return (
                                  <div key={step.key} className="flex items-start space-x-5">
                                      <div className="relative">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                          isCompleted
                                          ? `bg-gradient-to-br ${step.color} shadow-lg`
                                          : isCurrent
                                          ? `bg-gradient-to-br ${step.color} shadow-glow pulse-glow`
                                          : 'bg-neutral-100'
                                      }`}>
                                          <Icon className={`w-6 h-6 transition-colors duration-300 ${
                                          isCompleted || isCurrent ? 'text-white' : 'text-neutral-400'
                                          }`} />
                                      </div>
                                      {index < STATUS_STEPS.length - 1 && (
                                          <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 transition-colors duration-500 ${
                                          isCompleted ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-neutral-200'
                                          }`}></div>
                                      )}
                                      </div>
                                      <div className="flex-1 pb-8">
                                      <div className="flex items-center justify-between mb-2">
                                          <h4 className={`font-bold text-lg transition-colors duration-300 ${
                                          isCompleted
                                              ? 'text-green-800'
                                              : isCurrent
                                              ? 'text-orange-800'
                                              : 'text-neutral-500'
                                          }`}>
                                          {step.title}
                                          </h4>
                                          {isCompleted && (
                                          <CheckCircle className="w-6 h-6 text-green-600" />
                                          )}
                                      </div>
                                      <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                                          isCompleted
                                          ? 'text-green-700'
                                          : isCurrent
                                          ? 'text-orange-700'
                                          : 'text-neutral-500'
                                      }`}>
                                          {step.description}
                                      </p>
                                      {isCurrent && (
                                          <div className="flex items-center space-x-2 mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                                          <Clock className="w-4 h-4 text-orange-600" />
                                          <span className="text-sm font-semibold text-orange-800">
                                              ETA: {Math.round((STATUS_STEPS.length - 1 - currentStepIdx) * 2)} min
                                          </span>
                                          </div>
                                      )}
                                      </div>
                                  </div>
                                  );
                              })}
                              </div>
                          </div>
                        </div>
                  </>
              )}
            </>
          ) : (
            <>
              {/* Restored Demo Dashboard */}
              <div className="w-full max-w-5xl mx-auto">
                <div className="relative overflow-hidden rounded-2xl p-6 border bg-white shadow-glass mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-800 text-lg">DEMO12345</h4>
                        <div className="flex items-center space-x-3 text-sm text-neutral-600">
                          <span className="font-medium">Flight AI202</span>
                          <span>•</span>
                          <span className="font-medium">Carousel 5</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg mb-2`}>
                        {STATUS_STEPS[dummyStep].title}
                      </div>
                      <div className="text-sm text-neutral-600">
                        <div className="font-semibold">{Math.round((dummyStep / (STATUS_STEPS.length - 1)) * 100)}% Complete</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((dummyStep / (STATUS_STEPS.length - 1)) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                        style={{ width: `${(dummyStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Confidence: <b>{Math.round(80 + dummyStep * 3)}%</b> &nbsp;|&nbsp; Last seen: just now
                  </div>
                </div>
          <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-800">
                      Tracking Details: DEMO12345
              </h3>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <Camera className="w-4 h-4" />
                <span>AI-Powered Tracking</span>
              </div>
            </div>
            <div className="space-y-6">
                  {STATUS_STEPS.map((step, index) => {
                const Icon = step.icon;
                      const isCompleted = dummyStep >= index;
                      const isCurrent = dummyStep === index;
                return (
                        <div key={step.key} className="flex items-start space-x-5">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          isCompleted 
                            ? `bg-gradient-to-br ${step.color} shadow-lg` 
                            : isCurrent 
                            ? `bg-gradient-to-br ${step.color} shadow-glow pulse-glow` 
                            : 'bg-neutral-100'
                        }`}>
                          <Icon className={`w-6 h-6 transition-colors duration-300 ${
                            isCompleted || isCurrent ? 'text-white' : 'text-neutral-400'
                          }`} />
                        </div>
                              {index < STATUS_STEPS.length - 1 && (
                          <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 transition-colors duration-500 ${
                            isCompleted ? 'bg-gradient-to-b from-green-400 to-emerald-500' : 'bg-neutral-200'
                          }`}></div>
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-bold text-lg transition-colors duration-300 ${
                            isCompleted 
                              ? 'text-green-800' 
                              : isCurrent 
                              ? 'text-orange-800' 
                              : 'text-neutral-500'
                          }`}>
                            {step.title}
                          </h4>
                          {isCompleted && (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          isCompleted 
                            ? 'text-green-700' 
                            : isCurrent 
                            ? 'text-orange-700' 
                            : 'text-neutral-500'
                        }`}>
                          {step.description}
                        </p>
                        {isCurrent && (
                          <div className="flex items-center space-x-2 mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-semibold text-orange-800">
                                ETA: {Math.round((STATUS_STEPS.length - 1 - dummyStep) * 2)} min
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

              {/* Demo View for Unauthenticated Users */}
              <div className="relative mt-8 p-6 overflow-hidden rounded-2xl bg-white/50 shadow-glass border border-white/20">
                  <FloatingBaggage />
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                      <h3 className="text-2xl font-bold text-orange-600 mb-2">Sign in to track your real baggage</h3>
                      <p className="text-neutral-600 mb-4 max-w-md">
                          Get real-time updates, predictive ETAs, and carousel information.
                      </p>
                      <a href="/login" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition-all text-lg">
                          Sign In
                      </a>
                  </div>
              </div>
            </>
          )}
        </div>

        {/* Create Baggage Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-auto p-6 rounded-2xl shadow-glass bg-white/95 border border-white/30">
              <button
                className="absolute top-3 right-3 text-neutral-400 hover:text-red-500 transition"
                onClick={() => setShowCreateForm(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex flex-col items-center mb-4 relative z-10">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-glow mb-2">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Create Baggage Record</h2>
                <p className="text-neutral-500 text-xs">Enter details to add a new baggage record</p>
              </div>
              {createError && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm relative z-10">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
              {createSuccess && (
                <div className="flex flex-col items-center gap-2 p-4 mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-center text-base relative z-10 animate-fade-in">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-1" />
                  <span className="font-bold">Record Submitted Successfully</span>
                </div>
              )}
              <form onSubmit={handleCreateSubmit} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="bagId">
                    Baggage ID (optional)
                  </label>
                  <input
                    id="bagId"
                    name="bagId"
                    type="text"
                    value={createForm.bagId}
                    onChange={handleCreateChange}
                    className="w-full pl-4 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="e.g., SFO123456"
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="flightNumber">
                    Flight Number
                  </label>
                  <input
                    id="flightNumber"
                    name="flightNumber"
                    type="text"
                    value={createForm.flightNumber}
                    onChange={handleCreateChange}
                    className="w-full pl-4 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="e.g., AI202"
                    required
                    disabled={createLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="carouselNumber">
                    Carousel Number
                  </label>
                  <input
                    id="carouselNumber"
                    name="carouselNumber"
                    type="number"
                    min="1"
                    value={createForm.carouselNumber}
                    onChange={handleCreateChange}
                    className="w-full pl-4 pr-2 py-2 rounded-lg border border-gray-200 bg-white text-neutral-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    placeholder="e.g., 5"
                    required
                    disabled={createLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold text-base shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Place Footer at the bottom of the page */}
      <Footer />
    </>
  );
};

export default BaggageStatusPage;
