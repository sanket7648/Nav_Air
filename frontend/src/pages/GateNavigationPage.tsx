import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { RouteModal } from '../components/RouteModel';

export const GateNavigationPage: React.FC = () => {
  const [from, setFrom] = useState('mainEntrance');
  const [to, setTo] = useState('gateA3');
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for the modal
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get('/api/navigation/locations');
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setError("Could not load airport locations.");
      }
    };
    fetchLocations();
  }, []);

  const handleNavigation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/navigation/route?from=${from}&to=${to}`);
      setActiveRoute(response.data.route);
      setIsRouteModalOpen(true); // Open the modal with the new route
    } catch (error) {
      console.error("Error fetching route:", error);
      setError("Could not find a route. Please try different locations.");
    } finally {
      setLoading(false);
    }
  };

  // When the modal is open and the iframe is ready, send the route data
  useEffect(() => {
    if (isRouteModalOpen && iframeRef.current) {
      const iframe = iframeRef.current;
      const sendMessage = () => {
        iframe.contentWindow?.postMessage({
          type: 'NAVIGATE_ROUTE',
          payload: activeRoute,
        }, window.location.origin);
      };
      // The iframe might take a moment to load, so we send the message once it's ready
      iframe.onload = sendMessage;
      // If it's already loaded, send immediately
      if (iframe.contentWindow) {
        sendMessage();
      }
    }
  }, [isRouteModalOpen, activeRoute]);

  // --- NEW FUNCTION TO HANDLE THE TOUR ---
  const handleStartTour = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'START_TOUR', payload: activeRoute }, window.location.origin);
  };


  return (
    <div>
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-100 -z-10" />
      <div className="flex flex-col items-center py-6 sm:py-12 px-2 sm:px-0 pt-[100px] sm:pt-[100px] md:pb-[200px]">
        <div className="w-full max-w-5xl mx-auto">
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
              <h2 className="text-2xl font-bold mb-1">3D Airport Navigation</h2>
              <p className="text-emerald-100 text-base">Select your start and end points to visualize the route.</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="from-location" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <select id="from-location" value={from} onChange={e => setFrom(e.target.value)} className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition">
                  {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="to-location" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select id="to-location" value={to} onChange={e => setTo(e.target.value)} className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition">
                  {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
              </div>
              <button onClick={handleNavigation} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:opacity-50">
                {loading ? 'Finding...' : <><Search className="w-5 h-5 mr-2 inline" />Find Route</>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </div>

          {/* Placeholder for where the map used to be */}
          <div className="text-center p-10 bg-gray-50 rounded-2xl border border-dashed">
            <p className="text-gray-500">Your 3D route will appear in a pop-up window.</p>
          </div>
        </div>
      </div>

      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        route={activeRoute}
        iframeRef={iframeRef}
        onStartTour={handleStartTour} // Pass the new handler
      />
    </div>
  );
};

export default GateNavigationPage;