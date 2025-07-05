import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Filter,
  ArrowRight,
  MapPin
} from 'lucide-react';

export const FlightUpdatesPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState<string[]>([]);

  const flights = [
    {
      id: 1,
      flightNumber: 'UA123',
      airline: 'United Airlines',
      destination: 'Los Angeles',
      scheduledTime: '14:30',
      actualTime: '14:45',
      status: 'delayed',
      gate: 'B12',
      terminal: '3',
      delay: 15,
      reason: 'Weather conditions'
    },
    {
      id: 2,
      flightNumber: 'AA456',
      airline: 'American Airlines',
      destination: 'New York',
      scheduledTime: '15:15',
      actualTime: '15:15',
      status: 'on_time',
      gate: 'A8',
      terminal: '2',
      delay: 0,
      reason: null
    },
    {
      id: 3,
      flightNumber: 'DL789',
      airline: 'Delta Air Lines',
      destination: 'Chicago',
      scheduledTime: '16:00',
      actualTime: '15:45',
      status: 'early',
      gate: 'C15',
      terminal: '1',
      delay: -15,
      reason: null
    },
    {
      id: 4,
      flightNumber: 'SW234',
      airline: 'Southwest Airlines',
      destination: 'Las Vegas',
      scheduledTime: '16:30',
      actualTime: null,
      status: 'boarding',
      gate: 'B8',
      terminal: '3',
      delay: 0,
      reason: null
    },
  ];

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'on_time': return 'text-green-600 bg-green-100';
      case 'early': return 'text-blue-600 bg-blue-100';
      case 'boarding': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delayed': return AlertTriangle;
      case 'on_time': return CheckCircle;
      case 'early': return CheckCircle;
      case 'boarding': return Plane;
      default: return Clock;
    }
  };

  const getTimeUntilFlight = (scheduledTime: string) => {
    const now = new Date();
    const flightTime = new Date();
    const [hours, minutes] = scheduledTime.split(':');
    flightTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diff = flightTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return 'Departed';
    if (hoursUntil > 0) return `${hoursUntil}h ${minutesUntil}m`;
    return `${minutesUntil}m`;
  };

  const toggleNotification = (flightId: string) => {
    setNotifications(prev => 
      prev.includes(flightId) 
        ? prev.filter(id => id !== flightId)
        : [...prev, flightId]
    );
  };

  const filteredFlights = selectedFilter === 'all' 
    ? flights 
    : flights.filter(flight => flight.status === selectedFilter);

  return (
    <div className="pt-36 px-4 pb-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Flight Updates</h2>
        <p className="text-gray-600">Real-time departure information</p>
      </div>

      {/* Current Time */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-blue-100">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">San Francisco</div>
              <div className="text-xs text-blue-200">PST</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Flights' },
            { key: 'delayed', label: 'Delayed' },
            { key: 'on_time', label: 'On Time' },
            { key: 'boarding', label: 'Boarding' },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight Cards */}
      <div className="space-y-4">
        {filteredFlights.map((flight) => {
          const StatusIcon = getStatusIcon(flight.status);
          const timeUntil = getTimeUntilFlight(flight.scheduledTime);
          const isNotificationEnabled = notifications.includes(flight.flightNumber);

          return (
            <div
              key={flight.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{flight.flightNumber}</h3>
                    <p className="text-sm text-gray-600">{flight.airline}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(flight.flightNumber)}
                  className={`p-2 rounded-lg transition-colors ${
                    isNotificationEnabled
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">SFO</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {flight.destination}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                  <StatusIcon className="w-3 h-3 mr-1 inline" />
                  {flight.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Scheduled</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {flight.scheduledTime}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    {flight.status === 'delayed' ? 'Delayed' : 'Actual'}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {flight.actualTime || 'TBD'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>Gate {flight.gate}</span>
                  </div>
                  <div>Terminal {flight.terminal}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{timeUntil}</div>
                  {flight.status === 'delayed' && flight.reason && (
                    <div className="text-xs text-red-600">{flight.reason}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};