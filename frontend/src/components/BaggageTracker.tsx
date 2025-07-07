import React, { useState } from 'react';
import { baggageAPI } from '../services/api';

const STATUS_EVENTS = [
  'Checked In',
  'Security Cleared',
  'Loaded on Aircraft',
  'In Transit',
  'At Carousel',
  'Ready for Pickup',
];

const STATUS_COLORS: Record<string, string> = {
  'Checked In': '#3498db',
  'Security Cleared': '#27ae60',
  'Loaded on Aircraft': '#8e44ad',
  'In Transit': '#f39c12',
  'At Carousel': '#e67e22',
  'Ready for Pickup': '#27ae60',
};

const STATUS_ICONS: Record<string, string> = {
  'Checked In': '🛄',
  'Security Cleared': '🛡️',
  'Loaded on Aircraft': '✈️',
  'In Transit': '🚚',
  'At Carousel': '🎡',
  'Ready for Pickup': '📦',
};

function timeAgo(timestamp: number) {
  const diff = Math.floor((Date.now() - timestamp) / 60000);
  if (diff < 1) return 'just now';
  if (diff === 1) return '1 min ago';
  return `${diff} min ago`;
}

const BaggageTracker: React.FC = () => {
  const [tag, setTag] = useState('');
  const [bag, setBag] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBag(null);
    try {
      const data = await baggageAPI.get(tag);
      setBag(data);
    } catch (err) {
      setError('Baggage not found');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          value={tag}
          onChange={e => setTag(e.target.value)}
          placeholder="Enter baggage tag number (e.g., SFO123456)..."
          className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-r-lg font-semibold"
        >
          Track
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {bag && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-bold">{bag.bagId}</div>
              <div className="text-gray-500">
                Flight: {bag.flightNumber} &nbsp;|&nbsp; Carousel: {bag.carouselNumber}
              </div>
            </div>
            <div>
              <span
                className="px-4 py-2 rounded-full text-white font-bold"
                style={{ background: STATUS_COLORS[bag.currentStatus] }}
              >
                {bag.currentStatus}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>
                {Math.round(
                  (STATUS_EVENTS.indexOf(bag.currentStatus) / (STATUS_EVENTS.length - 1)) * 100
                )}
                % Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${
                    (STATUS_EVENTS.indexOf(bag.currentStatus) / (STATUS_EVENTS.length - 1)) * 100
                  }%`,
                  background: STATUS_COLORS[bag.currentStatus],
                }}
              ></div>
            </div>
          </div>
          <div className="mb-4 text-sm text-gray-600">
            Confidence: <b>{Math.round(bag.confidence * 100)}%</b> &nbsp;|&nbsp; Last seen:{' '}
            {timeAgo(bag.lastTimestamp)}
          </div>
          <div>
            <h3 className="font-bold mb-2">Tracking Details</h3>
            <div className="space-y-2">
              {STATUS_EVENTS.map((event, idx) => {
                const isCompleted = STATUS_EVENTS.indexOf(bag.currentStatus) >= idx;
                return (
                  <div
                    key={event}
                    className={`flex items-center p-3 rounded-lg ${
                      isCompleted ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl mr-4">{STATUS_ICONS[event]}</span>
                    <span
                      className={`font-semibold ${
                        isCompleted ? 'text-green-700' : 'text-gray-500'
                      }`}
                    >
                      {event}
                    </span>
                    {isCompleted && (
                      <span className="ml-auto text-green-500 font-bold">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaggageTracker;
