import axios from 'axios';

// Helper to format date as YYYYMMDD
function getTodayStr() {
  const today = new Date();
  return today.toISOString().slice(0, 10).replace(/-/g, '');
}

// Map the API flight object to your frontend format
function mapFlight(flight, type) {
  return {
    flightNumber: flight.flight_unique_no || flight.flightNumber || '',
    airline: flight.airline_name || '',
    airlineImg: flight.airline_img || '',
    origin: flight.base_airport_name || '',
    destination: flight.srcdest_airport_name || '',
    scheduledTime: flight.schedule_hour_id || '',
    estimatedTime: flight.estimated_hour_id || '',
    status: flight.flight_status_id || '',
    terminal: flight.baseTerminal || '',
    type
  };
}

// Fetch departures from BLR to ALL destinations (or a specific destination)
export async function scrapeBLRDepartures(destAirport = 'ALL') {
  try {
    const dateStr = getTodayStr();
    const url = `https://gateway.bengaluruairport.com/fis/v2/api/aodb/flights?orgAirport=BLR&destAirport=${destAirport}&boundId=dep&flDate=${dateStr}&`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const flights = response.data?.data?.dep || [];
    return flights.map(flight => mapFlight(flight, 'departure'));
  } catch (err) {
    console.error('Departures scraping failed:', err.message);
    return [];
  }
}

// Fetch arrivals to BLR from ALL origins (or a specific origin)
export async function scrapeBLRArrivals(orgAirport = 'ALL') {
  try {
    const dateStr = getTodayStr();
    const url = `https://gateway.bengaluruairport.com/fis/v2/api/aodb/flights?orgAirport=${orgAirport}&destAirport=BLR&boundId=arr&flDate=${dateStr}&`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    const flights = response.data?.data?.arr || [];
    return flights.map(flight => mapFlight(flight, 'arrival'));
  } catch (err) {
    console.error('Arrivals scraping failed:', err.message);
    return [];
  }
}
