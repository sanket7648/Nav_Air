import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  Filter,
  ArrowRight,
  MapPin,
  Loader2
} from 'lucide-react';
import { authUtils, getUserRegionFlights } from '../services/api';

export const FlightUpdatesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'arrivals' | 'departures' | 'domestic'>('arrivals');
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const isAuthenticated = authUtils.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    getUserRegionFlights().then(data => {
      setFlights(data.flights || []);
      setLocation(data.location || '');
      setLocationInfo(data.locationInfo || null);
      setLoading(false);
    }).catch(e => {
      setError(e.response?.data?.message || 'Failed to fetch flight data.');
      setLoading(false);
    });
  }, [isAuthenticated]);

  // --- SIGN-IN CARD (from BaggageStatusPage) ---
  const SignInCard = () => (
    <div className="relative mt-8 p-6 overflow-hidden rounded-2xl bg-white/50 shadow-glass border border-white/20">
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl font-bold text-orange-600 mb-2">Sign in to see real-time flight updates</h3>
        <p className="text-neutral-600 mb-4 max-w-md">
          Get arrivals, departures, and domestic flight info for your region.
        </p>
        <a href="/login" className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-bold shadow-md hover:from-blue-600 hover:to-fuchsia-600 transition-all text-lg">
          Sign In
        </a>
      </div>
    </div>
  );

  const formatTime = (iso: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // --- FLIGHT DATA UI ---
  const FlightsList = ({ flights }: { flights: any[] }) => (
    <div className="space-y-4 mt-4">
      {flights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f6eb.svg" alt="No flights" className="w-16 h-16 mb-4 opacity-80" />
          <div className="text-xl font-semibold text-gray-500 mb-2">No relevant flights found</div>
          <div className="text-gray-400">Check back later for updates.</div>
        </div>
      )}
      {flights.map((flight, idx) => (
        <div key={flight.flight_number + idx} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">{flight.airline}</div>
              <div className="text-sm text-gray-600">Flight {flight.flight_number || 'N/A'}</div>
              <div className="text-xs text-gray-400 mt-1">
                From {flight.departure_city || '—'}{flight.departure_iata ? ` (${flight.departure_iata})` : ''}
                {' '}to {flight.arrival_city || '—'}{flight.arrival_iata ? ` (${flight.arrival_iata})` : ''}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 min-w-[140px]">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-700">{formatTime(flight.departure_time)}</span>
              <span className="text-2xl text-blue-400">→</span>
              <span className="text-xl font-bold text-fuchsia-700">{formatTime(flight.arrival_time)}</span>
            </div>
            <div className="text-xs text-gray-400 mb-1">{formatDate(flight.departure_time)}</div>
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-fuchsia-500 shadow">
              {flight.status || 'Scheduled'}
            </div>
            <div className="text-xs text-gray-400">Terminal: {flight.terminal || '—'}</div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!isAuthenticated) {
    // Not signed in: show current UI + sign-in card
    return (
      <div className="pt-32 px-2 pb-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">Flight Updates</h2>
          <p className="text-gray-600 text-sm">Real-time departure information</p>
        </div>
        {/* Current Time */}
        <div className="mb-3">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-blue-100">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-100">Your Region</div>
                <div className="text-[10px] text-blue-200">Local Time</div>
              </div>
            </div>
          </div>
        </div>
        {/* Filters (static) */}
        <div className="mb-3">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {[
              { key: 'all', label: 'All Flights' },
              { key: 'delayed', label: 'Delayed' },
              { key: 'on_time', label: 'On Time' },
              { key: 'boarding', label: 'Boarding' },
            ].map((filter) => (
              <button
                key={filter.key}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors bg-gray-100 text-gray-700`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        {/* Demo Flight Cards (static) */}
        <div className="space-y-2">
          {/* ...existing static cards... */}
        </div>
        {/* Sign-in card */}
        <SignInCard />
      </div>
    );
  }

  // Signed in: show real flight data
  return (
    <div className="pt-32 px-2 pb-4 max-w-5xl mx-auto">
      {/* Location Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold mb-1">Flight Updates</h2>
              <p className="text-blue-100 text-sm">
                {locationInfo?.city && locationInfo?.country 
                  ? `${locationInfo.city}, ${locationInfo.country}`
                  : location 
                  ? `Flights for ${location}` 
                  : 'Arrivals, departures, and domestic flights near you'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Current Time</div>
              <div className="text-lg font-bold">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          
          {/* Airport Information */}
          {locationInfo?.nearestAirport && (
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-100">Nearest Airport</div>
                  <div className="font-bold text-lg">{locationInfo.nearestAirport.name}</div>
                  <div className="text-blue-200 text-sm">
                    {locationInfo.nearestAirport.code}
                    {locationInfo.nearestAirport.distance && ` • ${locationInfo.nearestAirport.distance} away`}
                  </div>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
          <div className="text-blue-500 font-semibold text-lg">Loading flight data...</div>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center py-16">
          <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a0.svg" alt="Error" className="w-14 h-14 mb-4 opacity-80" />
          <div className="text-xl font-bold text-red-600 mb-2">{error}</div>
          <div className="text-gray-500">Try again later or check your connection.</div>
        </div>
      )}
      {!loading && !error && <FlightsList flights={flights} />}
    </div>
  );
};