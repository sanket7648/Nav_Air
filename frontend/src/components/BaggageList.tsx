import React, { useEffect, useState } from 'react';
import { baggageAPI } from '../services/api';

const BaggageList: React.FC = () => {
  const [baggage, setBaggage] = useState<any[]>([]);

  useEffect(() => {
    baggageAPI.list().then(setBaggage);
  }, []);

  return (
    <div>
      <h2>Baggage List</h2>
      <ul>
        {baggage.map(bag => (
          <li key={bag.bagId}>
            Bag ID: {bag.bagId}, Flight: {bag.flightNumber}, Status: {bag.currentStatus}, Confidence: {bag.confidence}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BaggageList;
