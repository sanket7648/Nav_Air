import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Search,
  Clock,
  AlertTriangle,
  Plane,
  Shield,
  Camera,
  Bell,
  TrendingUp
} from 'lucide-react';

export const BaggageStatusPage: React.FC = () => {
  const [searchTag, setSearchTag] = useState('');
  const [selectedBag, setSelectedBag] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  const baggageItems = [
    {
      id: 1,
      tagNumber: 'SFO123456',
      flight: 'UA123',
      status: 'at_carousel',
      currentStep: 5,
      carousel: 3,
      estimatedTime: 'Ready now',
      weight: '23 kg',
      type: 'Checked Bag',
      priority: 'standard',
      lastUpdate: '2 min ago',
      confidence: 98
    },
    {
      id: 2,
      tagNumber: 'SFO789012',
      flight: 'UA123',
      status: 'in_transit',
      currentStep: 4,
      carousel: null,
      estimatedTime: '12 min',
      weight: '18 kg',
      type: 'Checked Bag',
      priority: 'priority',
      lastUpdate: '1 min ago',
      confidence: 95
    },
  ];

  const statusSteps = [
    { 
      id: 1, 
      title: 'Checked In', 
      icon: CheckCircle, 
      description: 'Bag received and tagged at check-in counter',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 2, 
      title: 'Security Cleared', 
      icon: Shield, 
      description: 'Successfully passed security screening',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 3, 
      title: 'Loaded on Aircraft', 
      icon: Plane, 
      description: 'Loaded onto flight UA123',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 4, 
      title: 'In Transit', 
      icon: Truck, 
      description: 'Being transported to baggage claim area',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 5, 
      title: 'At Carousel', 
      icon: MapPin, 
      description: 'Available for pickup at designated carousel',
      color: 'from-emerald-500 to-emerald-600'
    },
  ];

  const currentBag = baggageItems[selectedBag];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'at_carousel': return 'from-emerald-500 to-green-600';
      case 'in_transit': return 'from-orange-500 to-amber-600';
      case 'loaded': return 'from-purple-500 to-violet-600';
      case 'security': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'priority': return 'from-amber-400 to-yellow-500';
      case 'first_class': return 'from-purple-500 to-violet-600';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="pt-36 px-6 pb-8 min-h-screen bg-gradient-to-br from-neutral-50 via-orange-50/30 to-amber-50/20">
      {/* Header */}
      <div className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-600/20 to-yellow-600/20"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Baggage Intelligence</h2>
                <p className="text-orange-100 text-lg">Real-time tracking & predictions</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${realTimeUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">Live Tracking</span>
                </div>
                <div className="text-xs text-orange-200">Last update: {currentBag.lastUpdate}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-dark rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-5 h-5 text-accent-400" />
                  <span className="text-sm font-medium text-orange-100">Active Bags</span>
                </div>
                <div className="text-2xl font-bold">{baggageItems.length}</div>
                <div className="text-sm text-orange-200">Being tracked</div>
              </div>
              
              <div className="glass-dark rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent-400" />
                  <span className="text-sm font-medium text-orange-100">Accuracy</span>
                </div>
                <div className="text-2xl font-bold">{currentBag.confidence}%</div>
                <div className="text-sm text-orange-200">Prediction confidence</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Enter baggage tag number (e.g., SFO123456)..."
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-glass text-lg font-medium"
          />
        </div>
      </div>

      {/* Baggage Items */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-neutral-800">Your Baggage</h3>
          <button
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
              realTimeUpdates
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-glow'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Bell className="w-4 h-4 mr-1 inline" />
            {realTimeUpdates ? 'Notifications On' : 'Enable Notifications'}
          </button>
        </div>
        
        <div className="space-y-4">
          {baggageItems.map((bag, index) => {
            const isSelected = selectedBag === index;
            
            return (
              <div
                key={bag.id}
                onClick={() => setSelectedBag(index)}
                className={`relative overflow-hidden rounded-2xl p-6 border cursor-pointer transition-all duration-300 card-hover ${
                  isSelected
                    ? 'border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-glow'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-glass'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${getStatusColor(bag.status)} shadow-lg`}>
                      <Package className="w-7 h-7 text-white" />
                      {bag.priority === 'priority' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-900">P</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-800 text-lg">{bag.tagNumber}</h4>
                      <div className="flex items-center space-x-3 text-sm text-neutral-600">
                        <span className="font-medium">{bag.type}</span>
                        <span>•</span>
                        <span>{bag.weight}</span>
                        <span>•</span>
                        <span className="font-medium">Flight {bag.flight}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getStatusColor(bag.status)} shadow-lg mb-2`}>
                      {bag.status === 'at_carousel' ? 'Ready for Pickup' : 'In Transit'}
                    </div>
                    <div className="text-sm text-neutral-600">
                      <div className="font-semibold">{bag.estimatedTime}</div>
                      {bag.carousel && (
                        <div className="text-xs">Carousel {bag.carousel}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                    <span>Progress</span>
                    <span>{Math.round((bag.currentStep / statusSteps.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(bag.status)} transition-all duration-500`}
                      style={{ width: `${(bag.currentStep / statusSteps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-glass border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">
              Tracking Details: {currentBag.tagNumber}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <Camera className="w-4 h-4" />
              <span>AI-Powered Tracking</span>
            </div>
          </div>
          
          {/* Current Status Alert */}
          {currentBag.status === 'at_carousel' && (
            <div className="mb-6 p-5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-lg">Ready for Pickup!</h4>
                  <p className="text-emerald-700 font-medium">
                    Your bag is waiting at Carousel {currentBag.carousel} • Terminal 3, Level 2
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    Confidence: {currentBag.confidence}% • Last seen: {currentBag.lastUpdate}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentBag.currentStep;
              const isCurrent = index === currentBag.currentStep - 1;
              
              return (
                <div key={step.id} className="flex items-start space-x-5">
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
                    
                    {index < statusSteps.length - 1 && (
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
                          ETA: {currentBag.estimatedTime}
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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-2xl font-bold text-lg shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all duration-300">
          Get Directions
        </button>
        <button className="bg-white text-neutral-700 py-4 rounded-2xl font-bold text-lg border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-300">
          Set Alerts
        </button>
      </div>
    </div>
  );
};