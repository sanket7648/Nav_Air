import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Smartphone,
  ArrowRight,
  Target,
  Route,
  Compass,
  Eye,
  Volume2,
  Vibrate
} from 'lucide-react';

export const GateNavigationPage: React.FC = () => {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isARMode, setIsARMode] = useState(false);
  const [destination, setDestination] = useState('Gate B12');
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const floors = [
    { level: 1, name: 'Departure Level', zones: ['Gates A1-A15', 'Security', 'Check-in'] },
    { level: 2, name: 'Arrival Level', zones: ['Baggage Claim', 'Ground Transport', 'Customs'] },
    { level: 3, name: 'Dining & Shopping', zones: ['Food Court', 'Retail', 'Lounges'] },
  ];

  const routeSteps = [
    { 
      step: 1, 
      instruction: 'Head northwest toward Security Checkpoint A', 
      distance: '150m',
      duration: '2 min',
      landmark: 'Starbucks on your right',
      direction: 'northwest'
    },
    { 
      step: 2, 
      instruction: 'Pass through security screening area', 
      distance: '50m',
      duration: '5-10 min',
      landmark: 'Security checkpoint lanes 1-6',
      direction: 'straight'
    },
    { 
      step: 3, 
      instruction: 'Turn right after security toward B gates', 
      distance: '100m',
      duration: '1 min',
      landmark: 'Duty-free shop entrance',
      direction: 'right'
    },
    { 
      step: 4, 
      instruction: 'Continue straight to Gate B12', 
      distance: '200m',
      duration: '3 min',
      landmark: 'Gate B12 on your left',
      direction: 'straight'
    },
  ];

  const accessibilityFeatures = [
    { icon: Eye, label: 'Visual Guidance', active: true },
    { icon: Volume2, label: 'Audio Cues', active: false },
    { icon: Vibrate, label: 'Haptic Feedback', active: true },
  ];

  useEffect(() => {
    if (navigationStarted) {
      const timer = setInterval(() => {
        setCurrentStep(prev => (prev < routeSteps.length - 1 ? prev + 1 : prev));
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [navigationStarted]);

  return (
    <div className="pt-36 px-6 pb-8 min-h-screen bg-gradient-to-br from-neutral-50 via-emerald-50/30 to-teal-50/20">
      {/* Header */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Smart Navigation</h2>
                <p className="text-emerald-100 text-lg">AI-powered route optimization</p>
              </div>
              <button
                onClick={() => setIsARMode(!isARMode)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  isARMode 
                    ? 'bg-gradient-to-r from-accent-400 to-accent-500 text-accent-900 shadow-glow' 
                    : 'glass-dark text-white hover:bg-white/30'
                }`}
              >
                <Smartphone className="w-5 h-5 mr-2 inline" />
                {isARMode ? 'AR Active' : 'Enable AR'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-accent-400" />
                  <span className="text-sm font-medium text-emerald-100">Current</span>
                </div>
                <div className="text-lg font-bold">Security Checkpoint</div>
                <div className="text-sm text-emerald-200">Terminal 3, Level 1</div>
              </div>
              
              <div className="glass-dark rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-accent-400" />
                  <span className="text-sm font-medium text-emerald-100">Destination</span>
                </div>
                <div className="text-lg font-bold">{destination}</div>
                <div className="text-sm text-emerald-200">8 min walk • 500m</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Controls */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-glass border border-white/20">
          <h3 className="font-bold text-neutral-800 mb-4">Accessibility Features</h3>
          <div className="grid grid-cols-3 gap-3">
            {accessibilityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <button
                  key={index}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    feature.active
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">{feature.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl shadow-glass border border-white/20 overflow-hidden">
          {/* Map Controls */}
          <div className="p-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-neutral-600" />
                <select
                  value={currentFloor}
                  onChange={(e) => setCurrentFloor(Number(e.target.value))}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {floors.map((floor) => (
                    <option key={floor.level} value={floor.level}>
                      Floor {floor.level}: {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">
                  <Compass className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Map Visualization */}
          <div className="h-80 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Map Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-glow floating-animation">
                    <Navigation className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-900">3D</span>
                  </div>
                </div>
                <p className="text-neutral-700 font-semibold text-lg mb-2">Interactive Terminal Map</p>
                <p className="text-neutral-500 text-sm mb-4">
                  Floor {currentFloor}: {floors.find(f => f.level === currentFloor)?.name}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {floors.find(f => f.level === currentFloor)?.zones.map((zone, index) => (
                    <span key={index} className="px-3 py-1 bg-white/80 text-neutral-600 text-xs font-medium rounded-full">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Route Overlay */}
            <div className="absolute top-5 left-5 right-5">
              <div className="glass-morphism rounded-2xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <Route className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-neutral-800">Optimal Route</span>
                  </div>
                  <div className="flex items-center space-x-4 text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">8 min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">500m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Markers */}
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg pulse-glow"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  You are here
                </div>
              </div>
            </div>

            <div className="absolute top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                  Gate B12
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-800">Turn-by-Turn Directions</h3>
          {navigationStarted && (
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Navigation Active</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {routeSteps.map((step, index) => {
            const isActive = navigationStarted && index === currentStep;
            const isCompleted = navigationStarted && index < currentStep;
            
            return (
              <div
                key={step.step}
                className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-500 ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-glow' 
                    : isCompleted
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-110' 
                      : isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {step.step}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold transition-colors duration-300 ${
                        isActive ? 'text-emerald-800' : 'text-neutral-800'
                      }`}>
                        {step.instruction}
                      </h4>
                      <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? 'text-emerald-600 scale-110' : 'text-neutral-400'
                      }`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Distance: </span>
                        <span className="font-semibold text-neutral-700">{step.distance}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Duration: </span>
                        <span className="font-semibold text-neutral-700">{step.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mt-2">
                      <span className="font-medium">Landmark:</span> {step.landmark}
                    </p>
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setNavigationStarted(!navigationStarted)}
          className={`py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
            navigationStarted
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-glow hover:shadow-glow-lg'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glow hover:shadow-glow-lg hover:scale-105'
          }`}
        >
          {navigationStarted ? 'Stop Navigation' : 'Start Navigation'}
        </button>
        <button className="bg-white text-neutral-700 py-4 rounded-2xl font-bold text-lg border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-300">
          Share Location
        </button>
      </div>
    </div>
  );
};