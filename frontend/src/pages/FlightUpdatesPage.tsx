import React, { useState } from 'react';
import axios from 'axios';

const airportOptions = [
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'ALL', name: 'All Airports' }
];

export default function FlightUpdatesPage() {
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('ALL');
  const [date, setDate] = useState('');
  const [direction, setDirection] = useState<'dep' | 'arr'>('dep');
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFlights([]);
    try {
      const dateStr = date.replace(/-/g, '');
      const res = await axios.get(
        `/api/flights/search-flights?from=${from}&to=${to}&date=${dateStr}&direction=${direction}`
      );
      setFlights(res.data.flights);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch flights.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center py-6 sm:py-10 px-2 sm:px-0 pt-[120px] sm:pt-[140px]">
      <form
        onSubmit={handleSearch}
        className="bg-white shadow-2xl rounded-3xl p-4 sm:p-8 flex flex-col gap-4 sm:gap-6 w-full max-w-xl border border-blue-200"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-2">Track Your Flight</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-blue-700 font-semibold mb-1">Flying From</label>
            <select
              className="w-full p-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-400"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              {airportOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-blue-700 font-semibold mb-1">Flying To</label>
            <select
              className="w-full p-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-400"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              {airportOptions.map(opt => (
                <option key={opt.code} value={opt.code}>{opt.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-blue-700 font-semibold mb-1">Date</label>
          <input
            type="date"
            className="w-full p-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-400"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-blue-700 font-semibold mb-1">Direction</label>
          <select
            className="w-full p-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-400"
            value={direction}
            onChange={e => setDirection(e.target.value as 'dep' | 'arr')}
          >
            <option value="dep">Departures</option>
            <option value="arr">Arrivals</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform text-lg"
          disabled={loading}
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>

      <div className="mt-6 sm:mt-10 w-full max-w-3xl px-1 sm:px-0">
        {flights.length > 0 && (
          <div className="grid gap-6">
            {flights.map((flight, idx) => (
              <div
                key={flight.flightNumber + idx}
                className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6 border border-blue-100 hover:shadow-2xl transition-shadow"
              >
                <div className="flex-1">
                  <div className="text-xl font-bold text-blue-700">{flight.airline}</div>
                  <div className="text-gray-600">Flight: <span className="font-mono">{flight.flightNumber}</span></div>
                  <div className="text-gray-500">
                    {flight.origin} <span className="mx-2">→</span> {flight.destination}
                  </div>
                  <div className="text-gray-500">
                    Scheduled: <span className="font-semibold">{flight.scheduledTime?.replace('T', ' ')}</span>
                    {flight.estimatedTime && flight.estimatedTime !== flight.scheduledTime && (
                      <span> (Est: {flight.estimatedTime?.replace('T', ' ')})</span>
                    )}
                  </div>
                  <div className="text-gray-500">Terminal: <span className="font-semibold">{flight.terminal}</span></div>
                </div>
                <div>
                  <span className={`px-4 py-2 rounded-full text-white font-bold text-sm
                    ${flight.status === 'active' || flight.status === 'scheduled' || flight.status === 'scheduled' ? 'bg-green-500' :
                      flight.status === 'delayed' ? 'bg-yellow-500' :
                      flight.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-400'}`}>
                    {flight.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && flights.length === 0 && (
          <div className="text-center text-gray-500 mt-8 text-lg">No flights found for the selected criteria.</div>
        )}
      </div>
    </div>
  );
}