// sanket7648/nav_air/Nav_Air-0574471a0ced04019f897faf107a25b49ad56a5d/frontend/src/pages/FlightUpdatesPage.tsx
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
  Search,
  Filter,
  Calendar,
  ChevronDown // Added ChevronDown for select styling hint
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

// --- Airport List for Dropdowns ---
// (Inspired by the list in backend/data/mockFlights.js)
const AIRPORTS_LIST = [
  { code: 'DEL', name: 'Delhi (DEL)' },
  { code: 'BOM', name: 'Mumbai (BOM)' },
  { code: 'BLR', name: 'Bengaluru (BLR)' },
  { code: 'HYD', name: 'Hyderabad (HYD)' },
  { code: 'MAA', name: 'Chennai (MAA)' },
  { code: 'CCU', name: 'Kolkata (CCU)' },
  { code: 'PNQ', name: 'Pune (PNQ)' },
  { code: 'AMD', name: 'Ahmedabad (AMD)' },
  { code: 'JAI', name: 'Jaipur (JAI)' },
  { code: 'LKO', name: 'Lucknow (LKO)' },
  { code: 'VNS', name: 'Varanasi (VNS)' },
  { code: 'PAT', name: 'Patna (PAT)' },
  { code: 'GAU', name: 'Guwahati (GAU)' },
  { code: 'COK', name: 'Kochi (COK)' },
  { code: 'GOI', name: 'Goa (GOI)' },
  { code: 'IXB', name: 'Bagdogra (IXB)' },
  { code: 'IXC', name: 'Chandigarh (IXC)' },
  { code: 'ATQ', name: 'Amritsar (ATQ)' },
  // Add more airports as needed
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
// --- End Airport List ---


// A component for displaying a loading state skeleton UI
const FlightCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
    {/* Skeleton content remains the same */}
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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startFetching, setStartFetching] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);

  // Filter State
  const [departureAirport, setDepartureAirport] = useState('BLR'); // Default BLR
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [pnrNumber, setPnrNumber] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // setFlights([]); // Optionally clear

    const params: Record<string, string> = {};
    const trimmedPnr = pnrNumber.trim();
    const trimmedDep = departureAirport; // No need to trim/uppercase select value
    const trimmedArr = arrivalAirport; // No need to trim/uppercase select value

    if (trimmedPnr) {
      params.flight_iata = trimmedPnr;
      // Optionally reset dropdowns if needed by backend logic
      // setDepartureAirport('');
      // setArrivalAirport('');
    } else {
      if (trimmedDep) params.dep_iata = trimmedDep;
      if (trimmedArr) params.arr_iata = trimmedArr;
      if (selectedDate) params.flight_date = selectedDate;
    }

    console.log('Fetching flights with params:', params);

    try {
      const response = await axios.get('/api/flights', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log('API Response:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedData = response.data.data.map((f: any, i: number): Flight => ({
            id: `${f.flightNumber || `unknown-${i}`}-${f.scheduledDeparture || i}`,
            flightNumber: f.flightNumber || 'N/A',
            airline: f.airline || 'N/A',
            destination: f.destination || 'N/A',
            destinationIata: f.destinationIata || 'N/A',
            origin: f.origin || 'N/A',
            originIata: f.originIata || 'N/A',
            scheduledDeparture: f.scheduledDeparture || '',
            scheduledArrival: f.scheduledArrival || '',
            actualDeparture: f.actualDeparture || null,
            actualArrival: f.actualArrival || null,
            status: f.status || 'Scheduled',
            gate: f.gate || null,
            terminal: f.terminal || null,
            delay: f.delay || null
        }));
        setFlights(mappedData);
        setError(null);
      } else if (response.data && !response.data.success && response.data.message === 'No flight data available') {
        setFlights([]);
        setError(null);
        console.log('No flight data found for the given criteria.');
      } else {
         console.warn('Invalid data format or unsuccessful response:', response.data);
         throw new Error(response.data.message || 'Invalid data format received from server');
      }
    } catch (err) {
      console.error('Fetch Flights Error:', err);
      setFlights([]);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          setError('API rate limit exceeded. Please try again later.');
        } else if (err.response?.status === 401) {
          setError('Authentication error. Please log in again.');
          setShowSignInPopup(true);
        } else {
             setError(err.response?.data?.message || err.message || 'Could not fetch flight data. Please check filters and try again.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [departureAirport, arrivalAirport, selectedDate, pnrNumber]); // fetchFlights depends on these filters

  // --- Removed useEffect that automatically fetches on filter change ---
  // Now fetching is primarily triggered by the search button

  const getDerivedStatus = useCallback(/* ... as before ... */ (status: string | null, delay: number | null): { key: string; label: string } => {
    const lowerStatus = status?.toLowerCase() || 'unknown';
    if (lowerStatus.includes('cancel')) return { key: 'cancelled', label: 'CANCELLED' };
    if (lowerStatus.includes('landed')) return { key: 'landed', label: 'LANDED' };
    if (lowerStatus.includes('active') || lowerStatus.includes('en-route')) return { key: 'active', label: 'IN FLIGHT' };
    if (lowerStatus.includes('diverted')) return { key: 'diverted', label: 'DIVERTED' };
    if (lowerStatus.includes('scheduled')) {
        return delay != null && delay > 5 ? { key: 'delayed', label: 'DELAYED' } : { key: 'on_time', label: 'ON TIME' };
    }
     return { key: 'unknown', label: (status || 'unknown').toUpperCase() };
  }, []);

  const getStatusInfo = /* ... as before ... */ (statusKey: string) => {
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

  const getTimeUntilFlight = /* ... as before ... */ (scheduledTime: string, statusKey: string) => {
    if (['landed', 'cancelled', 'departed'].includes(statusKey) || !scheduledTime) return '';
    try {
        const now = new Date();
        const flightTime = new Date(scheduledTime);
        if (isNaN(flightTime.getTime())) return "Invalid Time";
        const diff = flightTime.getTime() - now.getTime();
        if (diff < -15 * 60 * 1000 && statusKey !== 'active') return 'Departed';
        if (diff < 0 && statusKey !== 'active') return 'Departing now';
        if (statusKey === 'active') return 'In Flight';
        const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
        const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hoursUntil > 0) return `in ${hoursUntil}h ${minutesUntil}m`;
        if (minutesUntil > 0) return `in ${minutesUntil}m`;
        return 'Boarding Soon';
    } catch (e) {
        console.error("Error calculating time until flight:", e, "Input time:", scheduledTime);
        return "Time Error";
    }
  };

  const formatTime = /* ... as before ... */ (timeString: string | null) => {
    if (!timeString) return 'TBD';
    try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
             console.warn("Invalid date/time format for formatTime:", timeString);
             if (/^\d{1,2}:\d{2}\s?(AM|PM)?$/i.test(timeString)) return timeString;
             return "Invalid";
        }
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true,
        });
    } catch (e) {
        console.error("Error formatting time:", e, "Input time:", timeString);
        return "Error";
    }
  };

  const toggleNotification = (flightId: string) => {
    setNotifications((prev) =>
      prev.includes(flightId) ? prev.filter((id) => id !== flightId) : [...prev, flightId]
    );
  };

  const filteredFlightsByStatus = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    if (selectedStatusFilter === 'all') return flights;
    return flights.filter((flight) => getDerivedStatus(flight.status, flight.delay).key === selectedStatusFilter);
  }, [flights, selectedStatusFilter, getDerivedStatus]);

  const statusFilterOptions = [
    { key: 'all', label: 'All Statuses' },
    { key: 'on_time', label: 'On Time' },
    { key: 'delayed', label: 'Delayed' },
    { key: 'active', label: 'In Flight' },
    { key: 'landed', label: 'Landed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!pnrNumber.trim() && (!departureAirport || !arrivalAirport)) { // Ensure dropdowns have selections if PNR is empty
         setError("Please enter a PNR/Flight No, or select both Departure and Arrival airports.");
         return;
      }
      if (user) {
          setError(null);
          setStartFetching(true);
          fetchFlights();
      } else {
          setShowSignInPopup(true);
      }
  };

  return (
    <div className="pt-24 px-4 sm:px-8 pb-8 min-h-screen bg-gray-50 flex flex-col">
      {showSignInPopup && <SignInPopup onClose={() => setShowSignInPopup(false)} />}
      <div className="max-w-4xl mx-auto flex-grow w-full">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Flight Updates</h2>
          <p className="text-gray-600">Real-time departure and arrival information.</p>
        </header>

        {/* Current Time Display */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-lg">
           {/* ... time display ... */}
           <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="text-sm text-blue-100">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{pnrNumber ? 'Flight Info' : (departureAirport || arrivalAirport || '...')}</div>
              <div className="text-xs text-blue-200">Local Time</div>
            </div>
          </div>
        </div>

        {/* --- Filter Form --- */}
        <form onSubmit={handleSearchSubmit} className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600"/> Find Your Flight
            </h3>
             <div className="mb-4">
                <label htmlFor="pnrNumber" className="block text-sm font-medium text-gray-700 mb-1">PNR / Flight Number (Optional)</label>
                <input
                    type="text"
                    id="pnrNumber"
                    value={pnrNumber}
                    onChange={(e) => { setPnrNumber(e.target.value); setError(null); }}
                    placeholder="e.g., AI123 or 6E 234"
                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

             <div className="text-center my-2 text-sm text-gray-500">OR</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* --- Departure Dropdown --- */}
                <div className="relative">
                    <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700 mb-1">Departure Airport</label>
                    <select
                        id="departureAirport"
                        value={departureAirport}
                        onChange={(e) => { setDepartureAirport(e.target.value); setError(null); }}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed pr-8" // Added appearance-none and pr-8
                        disabled={!!pnrNumber.trim()}
                        required={!pnrNumber.trim()}
                    >
                        <option value="" disabled>Select Departure</option>
                        {AIRPORTS_LIST.map(airport => (
                            <option key={airport.code} value={airport.code}>
                                {airport.name}
                            </option>
                        ))}
                    </select>
                    {/* Down arrow for select */}
                    <ChevronDown className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none"/>
                </div>
                {/* --- Arrival Dropdown --- */}
                 <div className="relative">
                    <label htmlFor="arrivalAirport" className="block text-sm font-medium text-gray-700 mb-1">Arrival Airport</label>
                    <select
                        id="arrivalAirport"
                        value={arrivalAirport}
                        onChange={(e) => { setArrivalAirport(e.target.value); setError(null); }}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed pr-8" // Added appearance-none and pr-8
                        disabled={!!pnrNumber.trim()}
                        required={!pnrNumber.trim()}
                    >
                        <option value="" disabled>Select Arrival</option>
                         {/* Filter out the selected departure airport */}
                        {AIRPORTS_LIST.filter(a => a.code !== departureAirport).map(airport => (
                            <option key={airport.code} value={airport.code}>
                                {airport.name}
                            </option>
                        ))}
                    </select>
                     {/* Down arrow for select */}
                    <ChevronDown className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none"/>
                </div>
                 {/* Date Input */}
                 <div className="relative">
                    <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        id="selectedDate"
                        value={selectedDate}
                        onChange={(e) => { setSelectedDate(e.target.value); setError(null); }}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!!pnrNumber.trim()}
                        required={!pnrNumber.trim()}
                    />
                     {/* Calendar icon - adjust positioning as needed */}
                     <Calendar className="absolute right-3 top-9 w-5 h-5 text-gray-400 pointer-events-none"/>
                </div>
            </div>
             <p className="text-xs text-gray-500 mb-4 text-center">
                Enter PNR/Flight No OR Select Departure, Arrival, and Date.
            </p>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50"
              disabled={isLoading || (!pnrNumber.trim() && (!departureAirport || !arrivalAirport))} // Updated disable logic for dropdowns
            >
              <Search className="w-5 h-5 mr-2"/>
              {isLoading ? 'Searching...' : 'Search Flights'}
            </button>
             {error && !isLoading && (
                 <div className="mt-4 text-center text-red-600 text-sm">{error}</div>
             )}
        </form>
        {/* --- End Filter Form --- */}


        {/* Initial state message or results area */}
        {!startFetching && !isLoading && !error && flights.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
             <Plane className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
            <p className="text-gray-600 mb-6">Enter your flight details above and click search.</p>
          </div>
        )}

        {startFetching && (
            <>
                {/* Status Filter Buttons */}
                <div className="mb-6">
                  {/* ... status filters ... */}
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Filter by Status:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {statusFilterOptions.map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => setSelectedStatusFilter(filter.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        selectedStatusFilter === filter.key
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border'
                        }`}
                    >
                        {filter.label}
                    </button>
                    ))}
                  </div>
                </div>

                {/* Flight Results Area */}
                <main className="space-y-4">
                  {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => <FlightCardSkeleton key={i} />)
                  ) : !error && filteredFlightsByStatus.length === 0 ? (
                      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                          {/* ... no flights message ... */}
                          <Plane className="w-16 h-16 mx-auto text-gray-300" />
                          <h3 className="mt-4 text-lg font-medium text-gray-900">No Flights Found</h3>
                          <p className="mt-1 text-sm text-gray-500">
                              No flights match your current search and filter criteria.
                          </p>
                      </div>
                  ) : !error ? (
                      filteredFlightsByStatus.map((flight) => {
                          const derivedStatus = getDerivedStatus(flight.status, flight.delay);
                          const { color, Icon } = getStatusInfo(derivedStatus.key);
                          const isNotificationEnabled = notifications.includes(flight.id);
                          const timeUntil = getTimeUntilFlight(flight.scheduledDeparture, derivedStatus.key);

                          return (
                              <div key={flight.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                  {/* Flight Card content remains the same */}
                                  {/* Top section */}
                                  <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-center space-x-4">
                                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden"><Plane className="w-6 h-6 text-blue-600" /></div>
                                          <div>
                                              <h3 className="font-bold text-lg text-gray-900">{flight.flightNumber}</h3>
                                              <p className="text-sm text-gray-600">{flight.airline}</p>
                                          </div>
                                      </div>
                                      <button onClick={() => toggleNotification(flight.id)} className={`p-2 rounded-full transition-colors ${ isNotificationEnabled ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title={isNotificationEnabled ? "Disable Notifications" : "Enable Notifications"}>
                                          <Bell className="w-5 h-5" />
                                      </button>
                                  </div>
                                  {/* Middle section */}
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                                          <span className="text-2xl font-semibold text-gray-900">{flight.originIata}</span>
                                          <ArrowRight className="w-5 h-5 text-gray-400 mt-1" />
                                          <span className="text-2xl font-semibold text-gray-900">{flight.destinationIata}</span>
                                      </div>
                                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center self-start sm:self-center ${color}`}>
                                          <Icon className="w-3 h-3 mr-1.5" />{derivedStatus.label}
                                      </div>
                                  </div>
                                  {/* Full Route Name */}
                                  <div className="text-sm text-gray-500 mb-4 ml-1 flex items-center flex-wrap">
                                      <MapPin className="w-3 h-3 mr-1 text-gray-400"/><span>{flight.origin}</span><ArrowRight className="w-3 h-3 inline mx-1.5 text-gray-400"/><span>{flight.destination}</span>
                                  </div>
                                  {/* Bottom section */}
                                  <div className="border-t border-gray-100 pt-4">
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center sm:text-left">
                                          <div><div className="text-xs text-gray-500 mb-1">Scheduled Dep.</div><div className="text-sm font-semibold text-gray-900">{formatTime(flight.scheduledDeparture)}</div></div>
                                          <div><div className="text-xs text-gray-500 mb-1">Estimated Dep.</div><div className={`text-sm font-semibold ${flight.delay && flight.delay > 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatTime(flight.actualDeparture)}</div></div>
                                          <div><div className="text-xs text-gray-500 mb-1">Scheduled Arr.</div><div className="text-sm font-semibold text-gray-900">{formatTime(flight.scheduledArrival)}</div></div>
                                          <div><div className="text-xs text-gray-500 mb-1">Estimated Arr.</div><div className={`text-sm font-semibold ${flight.delay && flight.delay > 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatTime(flight.actualArrival)}</div></div>
                                          <div><div className="text-xs text-gray-500 mb-1">Gate</div><div className="text-sm font-semibold text-gray-900">{flight.gate || '–'}</div></div>
                                          <div><div className="text-xs text-gray-500 mb-1">Terminal</div><div className="text-sm font-semibold text-gray-900">{flight.terminal || '–'}</div></div>
                                      </div>
                                  </div>
                                  {/* Delay Info */}
                                  {flight.delay != null && flight.delay > 0 && (<div className="mt-4 text-xs text-red-600 bg-red-50 p-2 rounded-md inline-flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>Delayed by {flight.delay} minutes.</div>)}
                                  {/* Time Until */}
                                  {timeUntil && (<div className="text-right mt-2 text-sm font-medium text-blue-600">{timeUntil}</div>)}
                              </div>
                          );
                      })
                  ) : null }
                </main>
            </>
        )}

      </div>
    </div>
  );
};