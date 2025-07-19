import express from 'express';
import axios from 'axios';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
import { scrapeBLRArrivals, scrapeBLRDepartures } from '../services/flightScraper.js';
const router = express.Router();

const AVIATIONSTACK_KEY = process.env.FLIGHTAPI_KEY;

// In-memory cache for flights
let cachedFlights = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

// Helper to get user ID from JWT if present
function getUserIdFromRequest(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; // Changed from decoded.id to decoded.userId
  } catch {
    return null;
  }
}

// GET /user-region-flights
router.get('/user-region-flights', async (req, res) => {
  try {
    // Get user ID from JWT
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    // Get user city/country from profile
    const userRows = await query('SELECT city, country FROM users WHERE id = $1', [userId]);
    const user = userRows[0];
    let userCity = user.city ? user.city.toLowerCase() : null;
    let userCountry = user.country ? user.country.toLowerCase() : null;
    
    // If user doesn't have location set, detect from IP
    let userLatitude = null;
    let userLongitude = null;
    let nearestAirport = null;
    
    if (!userCity && !userCountry) {
      try {
        // Get client IP
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
        if (clientIP === '::1' || clientIP === '127.0.0.1') {
          // Local development: use a default location (Bengaluru, BLR)
          userCity = 'bengaluru';
          userCountry = 'india';
          userLatitude = 13.1986;
          userLongitude = 77.7066;
          // Manually set nearestAirport for local dev
          nearestAirport = {
            name: 'Kempegowda International Airport',
            iataCode: 'BLR',
            distance: 0
          };
          console.log('Using fallback location for localhost: Bengaluru, India (Kempegowda International Airport, BLR)');
        } else {
          // Use ip-api.com to get location from IP
          const ipResponse = await axios.get(`http://ip-api.com/json/${clientIP}`);
          const ipData = ipResponse.data;
          if (ipData.status === 'success') {
            userCity = ipData.city ? ipData.city.toLowerCase() : null;
            userCountry = ipData.country ? ipData.country.toLowerCase() : null;
            userLatitude = ipData.lat;
            userLongitude = ipData.lon;
            // Update user's location in database for future use
            await query(
              'UPDATE users SET city = $1, country = $2, latitude = $3, longitude = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
              [ipData.city, ipData.country, userLatitude, userLongitude, userId]
            );
            console.log(`Auto-detected location: ${ipData.city}, ${ipData.country} (${userLatitude}, ${userLongitude})`);
          }
        }
      } catch (ipError) {
        console.error('IP location detection failed:', ipError.message);
        // Continue with null values - will show general flights
      }
    } else {
      // Get user's stored coordinates if available
      const userLocationRows = await query('SELECT latitude, longitude FROM users WHERE id = $1', [userId]);
      if (userLocationRows[0] && userLocationRows[0].latitude && userLocationRows[0].longitude) {
        userLatitude = userLocationRows[0].latitude;
        userLongitude = userLocationRows[0].longitude;
      }
    }
    
    // Find nearest airport if we have coordinates
    if (userLatitude && userLongitude && !nearestAirport) {
      try {
        // Use AeroDataBox API to find nearest airport
        const airportResponse = await axios.get(
          `https://aerodatabox.p.rapidapi.com/airports/search/location/${userLatitude}/${userLongitude}/km/50/16`,
          {
            headers: {
              'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
            }
          }
        );
        if (airportResponse.data && airportResponse.data.length > 0) {
          nearestAirport = airportResponse.data[0];
          console.log(`Nearest airport: ${nearestAirport.name} (${nearestAirport.iataCode})`);
        }
      } catch (airportError) {
        console.error('Airport lookup failed:', airportError.message);
        // Continue without airport info
      }
    }

    // Define airportIata after nearestAirport is determined
    const airportIata = nearestAirport?.iataCode?.toUpperCase();

    // Fetch/cached flights
    const now = Date.now();
    if (!cachedFlights || (now - cacheTimestamp >= CACHE_DURATION_MS)) {
      let arrivals = [];
      let departures = [];
      
      if (airportIata) {
        // Try flightapi.io first
        if (AVIATIONSTACK_KEY) {
          try {
            const today = new Date().toISOString().slice(0, 10);
            const arrUrl = `https://app.flightapi.io/arrivals/${AVIATIONSTACK_KEY}/${airportIata}/${today}`;
            const depUrl = `https://app.flightapi.io/departures/${AVIATIONSTACK_KEY}/${airportIata}/${today}`;
            const [arrRes, depRes] = await Promise.all([
              axios.get(arrUrl),
              axios.get(depUrl)
            ]);
            arrivals = arrRes.data || [];
            departures = depRes.data || [];
            console.log(`Successfully fetched ${arrivals.length} arrivals and ${departures.length} departures from flightapi.io`);
          } catch (apiErr) {
            console.error('flightapi.io fetch error:', apiErr.message);
            console.log('Falling back to web scraping...');
            
            // Fallback to web scraping for supported airports
            if (airportIata === 'BLR') {
              try {
                const [scrapedArrivals, scrapedDepartures] = await Promise.all([
                  scrapeBLRArrivals(),
                  scrapeBLRDepartures()
                ]);
                arrivals = scrapedArrivals;
                departures = scrapedDepartures;
                console.log(`Successfully scraped ${arrivals.length} arrivals and ${departures.length} departures from BLR website`);
              } catch (scrapeErr) {
                console.error('Web scraping failed:', scrapeErr.message);
              }
            } else {
              console.log(`Web scraping not available for airport ${airportIata}. Only BLR is currently supported.`);
            }
          }
        } else {
          console.log('No FLIGHTAPI_KEY provided, using web scraping fallback');
          // No API key, try web scraping directly
          if (airportIata === 'BLR') {
            try {
              const [scrapedArrivals, scrapedDepartures] = await Promise.all([
                scrapeBLRArrivals(),
                scrapeBLRDepartures()
              ]);
              arrivals = scrapedArrivals;
              departures = scrapedDepartures;
              console.log(`Successfully scraped ${arrivals.length} arrivals and ${departures.length} departures from BLR website`);
            } catch (scrapeErr) {
              console.error('Web scraping failed:', scrapeErr.message);
            }
          }
        }
      }
      
      cachedFlights = [...arrivals, ...departures];
      cacheTimestamp = now;
    }
    // Filter flights by user city/country and only today's flights
    // flightapi.io returns flights with different structure, so adapt mapping
    let relevantFlights = [];
    if (airportIata) {
      relevantFlights = cachedFlights.filter(f => {
        // For arrivals: f.arrival_airport_iata === airportIata
        // For departures: f.departure_airport_iata === airportIata
        const depIata = (f.departure_airport_iata || '').toUpperCase();
        const arrIata = (f.arrival_airport_iata || '').toUpperCase();
        return depIata === airportIata || arrIata === airportIata;
      });
    }
    // If we have location data, filter by region
    if (userCity || userCountry) {
      relevantFlights = relevantFlights.filter(f => {
        const depCity = f.departure_airport_city?.toLowerCase() || '';
        const arrCity = f.arrival_airport_city?.toLowerCase() || '';
        const depCountry = f.departure_airport_country?.toLowerCase() || '';
        const arrCountry = f.arrival_airport_country?.toLowerCase() || '';
        return (
          (userCity && (depCity.includes(userCity) || arrCity.includes(userCity))) ||
          (userCountry && (depCountry.includes(userCountry) || arrCountry.includes(userCountry)))
        );
      });
    }
    // If no location data or no regional flights found, show some general flights
    if (relevantFlights.length === 0) {
      relevantFlights = cachedFlights.slice(0, 10); // Show first 10 flights
    }
    // Format response for frontend
    const formatted = relevantFlights.map(f => ({
      flight_number: f.flight_iata || f.flight_number || '',
      airline: f.airline_name || f.airline || '',
      departure_city: f.departure_airport_city || '',
      departure_airport: f.departure_airport_name || '',
      departure_iata: f.departure_airport_iata || '',
      arrival_city: f.arrival_airport_city || '',
      arrival_airport: f.arrival_airport_name || '',
      arrival_iata: f.arrival_airport_iata || '',
      departure_time: f.departure_scheduled_time_utc || f.departure_time_utc || '',
      arrival_time: f.arrival_scheduled_time_utc || f.arrival_time_utc || '',
      terminal: f.departure_terminal || f.arrival_terminal || '',
      status: f.status || ''
    }));
    // Determine response message based on location availability
    let message = '';
    if (userCity || userCountry) {
      message = `Showing flights for ${userCity || userCountry} today`;
    } else {
      message = 'Showing general flight updates for today';
    }
    
    // Prepare location info
    const locationInfo = {
      city: userCity ? userCity.charAt(0).toUpperCase() + userCity.slice(1) : null,
      country: userCountry ? userCountry.charAt(0).toUpperCase() + userCountry.slice(1) : null,
      coordinates: userLatitude && userLongitude ? { lat: userLatitude, lng: userLongitude } : null,
      nearestAirport: nearestAirport ? {
        name: nearestAirport.name,
        code: nearestAirport.iataCode,
        distance: nearestAirport.distance ? `${Math.round(nearestAirport.distance)}km` : null
      } : null
    };
    
    if (!relevantFlights || relevantFlights.length === 0) {
      // If nearest airport is BLR, try scraping as fallback
      if (airportIata === 'BLR') {
        const [arrivals, departures] = await Promise.all([
          scrapeBLRArrivals(),
          scrapeBLRDepartures()
        ]);
        const scrapedFlights = [
          ...arrivals.map(f => ({
            flight_number: f.flightNumber,
            airline: f.airline,
            departure_city: f.origin || '',
            departure_airport: '',
            departure_iata: '',
            arrival_city: 'Bengaluru',
            arrival_airport: 'Kempegowda International Airport',
            arrival_iata: 'BLR',
            departure_time: f.scheduledTime,
            arrival_time: '',
            terminal: '',
            status: f.status,
            type: 'arrival'
          })),
          ...departures.map(f => ({
            flight_number: f.flightNumber,
            airline: f.airline,
            departure_city: 'Bengaluru',
            departure_airport: 'Kempegowda International Airport',
            departure_iata: 'BLR',
            arrival_city: f.destination || '',
            arrival_airport: '',
            arrival_iata: '',
            departure_time: f.scheduledTime,
            arrival_time: '',
            terminal: '',
            status: f.status,
            type: 'departure'
          }))
        ];
        if (scrapedFlights.length > 0) {
          return res.json({
            flights: scrapedFlights,
            message: 'Showing real-time flights for Kempegowda International Airport (BLR) from official airport website.',
            location: 'Bengaluru, India',
            locationInfo
          });
        }
      }
      // If not BLR or scraping failed, return original error
      return res.status(404).json({ flights: [], message: 'No flights found for your region or nearest airport.' });
    }

    res.json({ 
      flights: formatted, 
      message,
      location: userCity || userCountry ? `${userCity || ''}${userCity && userCountry ? ', ' : ''}${userCountry || ''}` : 'Auto-detected',
      locationInfo
    });
  } catch (err) {
    console.error('User region flights error:', err.message);
    res.status(500).json({ error: 'Failed to fetch or filter flights.' });
  }
});

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY; // Put your key in .env

function isValidDate(dateStr) {
  // Checks for YYYYMMDD format
  return /^\d{8}$/.test(dateStr);
}

router.get('/search-flights', async (req, res) => {
  try {
    const { from = 'BLR', to = 'ALL', date, direction = 'dep' } = req.query;
    // Only support BLR for web scraping
    if ((from !== 'BLR' && to !== 'BLR')) {
      return res.status(501).json({ error: 'Currently, only BLR airport is supported for live flight data.' });
    }
    // Use web scraping for BLR
    let flights = [];
    if (direction === 'dep') {
      flights = await scrapeBLRDepartures(to);
    } else if (direction === 'arr') {
      flights = await scrapeBLRArrivals(from);
    }
    res.json({ flights });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flights.' });
  }
});

router.get('/test-scraper', async (req, res) => {
  try {
    console.log('🧪 Testing real-time flight scraper...');
    
    const [departures, arrivals] = await Promise.all([
      scrapeBLRDepartures(),
      scrapeBLRArrivals()
    ]);
    
    res.json({
      success: true,
      message: 'Real-time scraper test completed',
      departures: {
        count: departures.length,
        flights: departures.slice(0, 3) // Show first 3 for testing
      },
      arrivals: {
        count: arrivals.length,
        flights: arrivals.slice(0, 3) // Show first 3 for testing
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test scraper error:', err.message);
    res.status(500).json({ error: 'Scraper test failed', details: err.message });
  }
});

router.get('/test-flightradar24', async (req, res) => {
  try {
    console.log('🛩️ Testing FlightRadar24 scraper...');
    
    const [departures, arrivals] = await Promise.all([
      scrapeFlightRadar24('departures'),
      scrapeFlightRadar24('arrivals')
    ]);
    
    res.json({
      success: true,
      message: 'FlightRadar24 scraper test completed',
      departures: {
        count: departures.length,
        flights: departures.slice(0, 5) // Show first 5 for testing
      },
      arrivals: {
        count: arrivals.length,
        flights: arrivals.slice(0, 5) // Show first 5 for testing
      },
      timestamp: new Date().toISOString(),
      source: 'FlightRadar24 API'
    });
  } catch (err) {
    console.error('FlightRadar24 test error:', err.message);
    res.status(500).json({ error: 'FlightRadar24 test failed', details: err.message });
  }
});

export default router; 