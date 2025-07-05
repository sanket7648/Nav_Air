import React, { useState } from 'react';
import { HelpCircle, Phone, MessageCircle, X, Headphones } from 'lucide-react';

export const FloatingActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { 
      icon: Phone, 
      label: 'Emergency Call', 
      action: () => window.open('tel:+1-800-AIRPORT'),
      color: 'from-red-500 to-red-600',
      description: 'Immediate assistance'
    },
    { 
      icon: MessageCircle, 
      label: 'Live Support', 
      action: () => alert('Connecting to live support...'),
      color: 'from-blue-500 to-blue-600',
      description: 'Chat with agent'
    },
    { 
      icon: Headphones, 
      label: 'Audio Guide', 
      action: () => alert('Starting audio navigation...'),
      color: 'from-purple-500 to-purple-600',
      description: 'Voice assistance'
    },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user?.username || 'Anonymous User';

  return (
    <div className="fixed bottom-6 right-4 z-50">
      {isExpanded && (
        <div className="mb-4 space-y-2 animate-slide-up">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <button
                  onClick={action.action}
                  className={`flex items-center space-x-2 bg-white/95 backdrop-blur-xl text-neutral-800 pl-3 pr-4 py-2.5 rounded-xl shadow-glass border border-white/20 hover:shadow-glow transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}
                  style={{ minWidth: 0 }}
                >
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${action.color} shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-xs">{action.label}</div>
                    <div className="text-[10px] text-neutral-500">{action.description}</div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative w-12 h-12 rounded-xl shadow-glow transition-all duration-500 transform ${
          isExpanded 
            ? 'bg-gradient-to-br from-red-500 to-red-600 rotate-180 scale-105' 
            : 'bg-gradient-to-br from-primary-500 to-primary-600 hover:scale-105 hover:shadow-glow-lg floating-animation'
        }`}
      >
        <div className="absolute inset-0 rounded-xl bg-white/20 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-center h-full">
          {isExpanded ? (
            <X className="w-5 h-5 text-white transition-transform duration-300" />
          ) : (
            <HelpCircle className="w-5 h-5 text-white transition-transform duration-300" />
          )}
        </div>
        
        {!isExpanded && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          </>
        )}
      </button>
    </div>
  );
};