import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// --- TYPE DEFINITIONS ---
type Flight = {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledTime: string;
  estimatedTime: string;
  terminal: string;
  status: 'delayed' | 'scheduled' | 'active' | 'cancelled' | string;
};

type Direction = 'dep' | 'arr';

// --- MOCK DATA & OPTIONS ---
const airportOptions = [
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'ALL', name: 'All Airports' },
];

// --- HELPER COMPONENTS ---

// A more polished Modal Component
function Modal({ show, onClose, children }: { show: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center animate-popIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {children}
      </div>
    </div>
  );
}

// Dedicated component for the search form
function FlightSearchForm({
  from, setFrom, to, setTo, date, setDate, direction, setDirection, onSubmit, loading
}) {
  const handleSwap = () => {
    if (from !== 'ALL' && to !== 'ALL') {
      const temp = from;
      setFrom(to);
      setTo(temp);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-2xl p-6 sm:p-8 animate-fadeInUp"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-3">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        Flight Status
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* From Airport */}
        <div className="md:col-span-2">
          <label htmlFor="from-airport" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <select id="from-airport" value={from} onChange={e => setFrom(e.target.value)} className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition">
            {airportOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.name} ({opt.code})</option>)}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center items-center h-full">
          <button type="button" onClick={handleSwap} className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-all transform hover:rotate-180 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          </button>
        </div>

        {/* To Airport */}
        <div className="md:col-span-2">
          <label htmlFor="to-airport" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <select id="to-airport" value={to} onChange={e => setTo(e.target.value)} className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition">
            {airportOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.name} ({opt.code})</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition" />
        </div>
        <div>
          <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
          <select id="direction" value={direction} onChange={e => setDirection(e.target.value as Direction)} className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition">
            <option value="dep">Departures</option>
            <option value="arr">Arrivals</option>
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            <span>Searching...</span>
          </>
        ) : (
          "Track Flights"
        )}
      </button>
    </form>
  );
}

// Individual Flight Card component
function FlightCard({ flight }: { flight: Flight }) {
  const statusStyles = {
    scheduled: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    delayed: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const statusClass = statusStyles[flight.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 animate-fadeInUp">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-xl text-gray-800">{flight.airline}</p>
          <p className="text-sm text-gray-500 font-mono">{flight.flightNumber}</p>
        </div>
        <div className={`px-3 py-1 text-sm font-semibold rounded-full ${statusClass}`}>
          {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
        </div>
      </div>
      <div className="flex items-center justify-between text-gray-700">
        <div className="text-center">
          <p className="font-bold text-2xl">{flight.origin}</p>
        </div>
        <div className="flex items-center text-blue-500">
            <span className="w-4 h-px bg-gray-300"></span>
            <svg className="w-5 h-5 mx-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            <span className="w-16 h-px bg-gray-300"></span>
        </div>
        <div className="text-center">
          <p className="font-bold text-2xl">{flight.destination}</p>
        </div>
      </div>
      <div className="border-t border-gray-200 mt-2 pt-4 flex justify-between text-sm text-gray-600">
        <div>
          <p>Scheduled: <span className="font-semibold text-gray-800">{new Date(flight.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
          {flight.estimatedTime !== flight.scheduledTime && (
             <p>Estimated: <span className="font-semibold text-yellow-600">{new Date(flight.estimatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></p>
          )}
        </div>
        <p>Terminal: <span className="font-semibold text-gray-800">{flight.terminal}</span></p>
      </div>
    </div>
  );
}

// Skeleton loader for a better loading UX
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded mt-2"></div>
                        </div>
                        <div className="h-7 w-24 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                        <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="border-t border-gray-200 mt-6 pt-4">
                        <div className="h-5 w-40 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Display component for when there are no flights
function EmptyState() {
    return (
        <div className="text-center text-gray-500 mt-12 animate-fadeInUp">
            <div className="inline-block bg-gray-100 p-5 rounded-full">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-700">No Flights Found</h3>
            <p className="mt-1 text-gray-500">Enter your flight details above to begin tracking.</p>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function FlightUpdatesPage() {
  const { isAuthenticated } = useAuth();
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('ALL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [direction, setDirection] = useState<Direction>('dep');
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowSignInModal(true);
      return;
    }
    setLoading(true);
    setError('');
    setFlights([]);
    setHasSearched(true);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const mockFlights: Flight[] = [
          { airline: 'IndiGo', flightNumber: '6E 234', origin: from, destination: to === 'ALL' ? 'DEL' : to, scheduledTime: '2025-07-19T10:30', estimatedTime: '2025-07-19T10:45', terminal: 'T1', status: 'delayed' },
          { airline: 'Air India', flightNumber: 'AI 505', origin: from, destination: to === 'ALL' ? 'BOM' : to, scheduledTime: '2025-07-19T11:00', estimatedTime: '2025-07-19T11:00', terminal: 'T2', status: 'scheduled' },
          { airline: 'Vistara', flightNumber: 'UK 809', origin: from, destination: to === 'ALL' ? 'MAA' : to, scheduledTime: '2025-07-19T12:15', estimatedTime: '2025-07-19T12:15', terminal: 'T1', status: 'active' },
          { airline: 'SpiceJet', flightNumber: 'SG 816', origin: from, destination: to === 'ALL' ? 'CCU' : to, scheduledTime: '2025-07-19T09:00', estimatedTime: '2025-07-19T09:00', terminal: 'T1', status: 'cancelled' },
      ];
      // Filter mock flights to simulate a real search
      const results = mockFlights.filter(f => f.origin === from && (to === 'ALL' || f.destination === to));
      setFlights(results);

    } catch (err: any) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }
    if (error) {
      return <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg animate-shake">{error}</div>;
    }
    if (flights.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {flights.map((flight) => (
            <FlightCard key={flight.flightNumber} flight={flight} />
          ))}
        </div>
      );
    }
    if (hasSearched) {
      return <EmptyState />;
    }
    return null; // Don't show anything before the first search
  };

  return (
    <>
      <Modal show={showSignInModal} onClose={() => setShowSignInModal(false)}>
        <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-100 text-blue-600 rounded-full p-4">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Sign In Required</h3>
            <p className="text-gray-600 max-w-xs">Please sign in to your account to track flights and view live updates.</p>
            <a href="/login" className="mt-2 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
              Go to Sign In
            </a>
        </div>
      </Modal>

      {/* Main Page Layout */}
      <div className="fixed inset-0 bg-gray-50 -z-10" />
      <div className="flex flex-col items-center justify-start min-h-screen py-10 sm:py-16 px-4 pt-[100px] sm:pt-[120px]">
        <FlightSearchForm
          from={from} setFrom={setFrom}
          to={to} setTo={setTo}
          date={date} setDate={setDate}
          direction={direction} setDirection={setDirection}
          onSubmit={handleSearch}
          loading={loading}
        />
        
        <div className="mt-12 w-full flex justify-center">
            {renderResults()}
        </div>
      </div>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-popIn { animation: popIn 0.3s ease-out forwards; }
        @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </>
  );
}