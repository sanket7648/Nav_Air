import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Phone, 
  Shield, 
  Heart, 
  Flame,
  MapPin,
  Users,
  HelpCircle,
  Share2,
  Clock
} from 'lucide-react';

export const EmergencyAssistancePage: React.FC = () => {
  const [isLocationShared, setIsLocationShared] = useState(false);
  const [emergencyContacted, setEmergencyContacted] = useState<string | null>(null);

  const emergencyContacts = [
    {
      id: 'security',
      title: 'Airport Security',
      description: 'Security incidents, suspicious activity',
      icon: Shield,
      phone: '+1-650-555-0101',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      id: 'medical',
      title: 'Medical Emergency',
      description: 'Medical assistance, first aid',
      icon: Heart,
      phone: '+1-650-555-0102',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    },
    {
      id: 'fire',
      title: 'Fire Department',
      description: 'Fire, smoke, evacuation',
      icon: Flame,
      phone: '+1-650-555-0103',
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700'
    },
    {
      id: 'police',
      title: 'Airport Police',
      description: 'Crime, disputes, general police',
      icon: Shield,
      phone: '+1-650-555-0104',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
  ];

  const quickActions = [
    {
      id: 'lost',
      title: 'Lost & Found',
      description: 'Report lost items',
      icon: HelpCircle,
      action: () => alert('Connecting to Lost & Found...')
    },
    {
      id: 'assistance',
      title: 'Accessibility Help',
      description: 'Mobility assistance',
      icon: Users,
      action: () => alert('Requesting accessibility assistance...')
    },
    {
      id: 'info',
      title: 'Information Desk',
      description: 'General inquiries',
      icon: HelpCircle,
      action: () => alert('Connecting to information desk...')
    },
  ];

  const handleEmergencyCall = (contact: typeof emergencyContacts[0]) => {
    setEmergencyContacted(contact.id);
    window.open(`tel:${contact.phone}`);
    
    // Reset after 5 seconds
    setTimeout(() => {
      setEmergencyContacted(null);
    }, 5000);
  };

  const handleSOSPress = () => {
    if (confirm('This will contact emergency services immediately. Continue?')) {
      setEmergencyContacted('sos');
      window.open('tel:911');
      
      setTimeout(() => {
        setEmergencyContacted(null);
      }, 5000);
    }
  };

  return (
    <div className="pt-36 px-6 pb-12 min-h-screen bg-gradient-to-br from-neutral-50 via-red-50/30 to-orange-50/20">
      <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
        <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Emergency Assistance</h2>
        <p className="text-gray-600 text-base">Quick access to help when you need it</p>
      </div>

      {/* SOS Button */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-3 text-white">
          <div className="text-center">
            <h3 className="text-base font-semibold mb-2">Emergency SOS</h3>
            <button
              onClick={handleSOSPress}
              className={`w-24 h-24 rounded-full font-bold text-lg transition-all transform ${
                emergencyContacted === 'sos'
                  ? 'bg-red-800 scale-95'
                  : 'bg-red-500 hover:bg-red-400 hover:scale-105 active:scale-95'
              } shadow-2xl`}
            >
              {emergencyContacted === 'sos' ? (
                <div className="flex flex-col items-center">
                  <Clock className="w-6 h-6 mb-1 animate-pulse" />
                  <span className="text-xs">Calling...</span>
                </div>
              ) : (
                <>
                  <AlertTriangle className="w-6 h-6 mb-1 mx-auto" />
                  SOS
                </>
              )}
            </button>
            <p className="text-xs text-red-100 mt-2">
              Press and hold to call 911
            </p>
          </div>
        </div>
      </div>

      {/* Location Sharing */}
      <div className="mb-4">
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Location Sharing</h4>
                <p className="text-xs text-gray-600">
                  {isLocationShared ? 'Location is being shared' : 'Share location with emergency services'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsLocationShared(!isLocationShared)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isLocationShared
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isLocationShared ? 'Sharing' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Emergency Contacts</h3>
        <div className="grid grid-cols-1 gap-2">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            const isActive = emergencyContacted === contact.id;
            
            return (
              <button
                key={contact.id}
                onClick={() => handleEmergencyCall(contact)}
                className={`p-2.5 rounded-xl text-left transition-all transform ${
                  isActive
                    ? `${contact.color} scale-95`
                    : `bg-white border border-gray-200 hover:shadow-md hover:scale-105 active:scale-95`
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : `${contact.color}`
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'} text-sm`}>
                      {contact.title}
                    </h4>
                    <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                      {contact.description}
                    </p>
                    {isActive && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-xs text-white">Calling...</span>
                      </div>
                    )}
                  </div>
                  <Phone className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="p-2.5 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Information */}
      <div className="bg-blue-50 rounded-2xl p-3">
        <h3 className="text-base font-semibold text-blue-900 mb-2">Safety Information</h3>
        <div className="space-y-1 text-xs text-blue-800">
          <p>• Emergency exits are located throughout the terminal</p>
          <p>• Assembly points are marked with green signs</p>
          <p>• AED devices are available at information desks</p>
          <p>• Security personnel patrol all areas 24/7</p>
        </div>
        </div>
      </div>
    </div>
  );
};