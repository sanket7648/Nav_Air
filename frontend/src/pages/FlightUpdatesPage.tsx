// sanket7648/nav_air/Nav_Air-829cba947a0fef3ed62fd6d062b82f00dfe48634/frontend/src/pages/FlightUpdatesPage.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle,
  Bell,
  ArrowRight,
  MapPin,
  XCircle,
  ServerCrash,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SignInPopup from '../components/SignInPopup';

// Define the structure of flight data we expect from our backend API
interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  destination: string;
  destinationIata: string;
  origin: string;
  originIata: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  actualDeparture: string | null;
  actualArrival: string | null;
  status: string;
  gate: string | null;
  terminal: string | null;
  delay: number | null;
}

// A component for displaying a loading state skeleton UI
const FlightCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <div className="h-6 bg-gray-200 rounded w-12"></div>
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded-full w-24"></div>
    </div>
    <div className="border-t border-gray-100 pt-4 mt-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FlightUpdatesPage: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startFetching, setStartFetching] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  const { user } = useAuth();

  // Effect to update the current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/flights', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const data = response.data.data.map((f: any, i: number) => ({
          ...f,
          id: `${f.flightNumber}-${f.scheduledDeparture}-${i}`,
        }));
        setFlights(data);
        setError(null);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        // Fallback to mock data if rate limit is hit
        try {
          const response = await axios.get('http://localhost:5000/api/flights/mock');
          const data = response.data.map((f: any, i: number) => ({
            ...f,
            id: `${f.flightNumber}-${f.scheduledTime}-${i}`,
          }));
          setFlights(data);
          setError('Showing mock data due to API rate limits.');
        } catch (mockErr) {
          setError('Could not fetch flight data. The server might be down or there was a network issue.');
          console.error(mockErr);
        }
      } else {
        setError('Could not fetch flight data. The server might be down or there was a network issue.');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch flight data on component mount and every 10 minutes thereafter
  useEffect(() => {
    if (startFetching) {
      fetchFlights();
      const intervalId = setInterval(fetchFlights, 600000); // Refresh every 10 minutes
      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [fetchFlights, startFetching]);

  // Derives a user-friendly status from the raw API status and delay information
  const getDerivedStatus = useCallback((status: string | null, delay: number | null): { key: string; label: string } => {
    switch (status) {
      case 'scheduled':
        return delay && delay > 5 ? { key: 'delayed', label: 'DELAYED' } : { key: 'on_time', label: 'ON TIME' };
      case 'active':
        return { key: 'active', label: 'IN FLIGHT' };
      case 'landed':
        return { key: 'landed', label: 'LANDED' };
      case 'cancelled':
        return { key: 'cancelled', label: 'CANCELLED' };
      case 'diverted':
        return { key: 'diverted', label: 'DIVERTED' };
      default:
        return { key: 'unknown', label: (status || 'unknown').toUpperCase() };
    }
  }, []);

  // Returns color and icon based on the derived status
  const getStatusInfo = (statusKey: string) => {
    const statusMap = {
      delayed: { color: 'text-red-600 bg-red-100', Icon: AlertTriangle },
      on_time: { color: 'text-green-600 bg-green-100', Icon: CheckCircle },
      active: { color: 'text-blue-600 bg-blue-100', Icon: Plane },
      landed: { color: 'text-indigo-600 bg-indigo-100', Icon: CheckCircle },
      cancelled: { color: 'text-gray-600 bg-gray-100', Icon: XCircle },
      diverted: { color: 'text-yellow-600 bg-yellow-100', Icon: AlertTriangle },
      unknown: { color: 'text-gray-600 bg-gray-100', Icon: Clock },
    };
    return statusMap[statusKey as keyof typeof statusMap] || statusMap.unknown;
  };

  // Calculates and formats the time until a flight's departure
  const getTimeUntilFlight = (scheduledTime: string) => {
    const now = new Date();
    const flightTime = new Date(scheduledTime);

    const diff = flightTime.getTime() - now.getTime();
    if (diff < -15 * 60 * 1000) return 'Departed';
    if (diff < 0) return 'Departing now';

    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursUntil > 0) return `in ${hoursUntil}h ${minutesUntil}m`;
    return `in ${minutesUntil}m`;
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'TBD';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const toggleNotification = (flightId: string) => {
    setNotifications((prev) =>
      prev.includes(flightId) ? prev.filter((id) => id !== flightId) : [...prev, flightId]
    );
  };

  const filteredFlights = useMemo(() => {
    if (selectedFilter === 'all') return flights;
    return flights.filter((flight) => getDerivedStatus(flight.status, flight.delay).key === selectedFilter);
  }, [flights, selectedFilter, getDerivedStatus]);

  const filterOptions = [
    { key: 'all', label: 'All Flights' },
    { key: 'on_time', label: 'On Time' },
    { key: 'delayed', label: 'Delayed' },
    { key: 'active', label: 'In Flight' },
    { key: 'landed', label: 'Landed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleGetFlightDetails = () => {
    if (user) {
      setStartFetching(true);
    } else {
      setShowSignInPopup(true);
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-8 pb-8 min-h-screen bg-gray-50">
      {showSignInPopup && <SignInPopup onClose={() => setShowSignInPopup(false)} />}
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Flight Updates</h2>
          <p className="text-gray-600">Real-time departure information for your journey.</p>
        </header>

        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <div className="text-sm text-blue-100">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{flights.length > 0 ? flights[0].originIata : '...'}</div>
              <div className="text-xs text-blue-200">Local Time</div>
            </div>
          </div>
        </div>

        {!startFetching ? (
          <div className="text-center py-16">
            <button
              onClick={handleGetFlightDetails}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg"
            >
              Get Flight Details
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedFilter === filter.key
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <main className="space-y-4">
              {isLoading && flights.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => <FlightCardSkeleton key={i} />)
              ) : error && flights.length === 0 ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center shadow-md">
                  <ServerCrash className="w-8 h-8 mr-4 text-red-500" />
                  <div>
                    <p className="font-bold text-lg">Unable to Load Flight Data</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : filteredFlights.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <Plane className="w-16 h-16 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Flights Found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no flights matching your current filter.
                  </p>
                </div>
              ) : (
                filteredFlights.map((flight) => {
                  const derivedStatus = getDerivedStatus(flight.status, flight.delay);
                  const { color, Icon } = getStatusInfo(derivedStatus.key);
                  const isNotificationEnabled = notifications.includes(flight.id);

                  return (
                    <div
                      key={flight.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{flight.flightNumber}</h3>
                            <p className="text-sm text-gray-600">{flight.airline}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleNotification(flight.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isNotificationEnabled
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <Bell className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-semibold text-gray-900">{flight.originIata}</span>
                          <ArrowRight className="w-6 h-6 text-gray-400 mt-1" />
                          <span className="text-2xl font-semibold text-gray-900">{flight.destinationIata}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${color}`}>
                          <Icon className="w-3 h-3 mr-1.5" />
                          {derivedStatus.label}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 mb-4 ml-1">{flight.destination}</div>

                      <div className="border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Scheduled</div>
                            <div className="text-base font-semibold text-gray-900">
                              {formatTime(flight.scheduledDeparture)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Estimated</div>
                            <div
                              className={`text-base font-semibold ${
                                flight.delay && flight.delay > 0 ? 'text-red-500' : 'text-gray-900'
                              }`}
                            >
                              {formatTime(flight.actualDeparture)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Gate</div>
                            <div className="text-base font-semibold text-gray-900 flex items-center">
                              <MapPin className="w-3 h-3 mr-1.5 text-gray-400" />
                              {flight.gate || '–'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Terminal</div>
                            <div className="text-base font-semibold text-gray-900">{flight.terminal || '–'}</div>
                          </div>
                        </div>
                      </div>

                      {flight.delay && flight.delay > 0 && (
                        <div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded-md">
                          Delayed by {flight.delay} minutes.
                        </div>
                      )}

                      <div className="text-right mt-2 text-sm font-medium text-blue-600">
                        {getTimeUntilFlight(flight.scheduledDeparture)}
                      </div>
                    </div>
                  );
                })
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
};