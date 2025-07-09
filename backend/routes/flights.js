import express from 'express';
import axios from 'axios';
import { query } from '../config/database.js';
import jwt from 'jsonwebtoken';
const router = express.Router();

const AVIATIONSTACK_KEY = process.env.AVIATIONSTACK_KEY;

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

    // Fetch/cached flights
    const now = Date.now();
    if (!cachedFlights || (now - cacheTimestamp >= CACHE_DURATION_MS)) {
      const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATIONSTACK_KEY}&limit=100`;
      const response = await axios.get(url);
      cachedFlights = response.data && response.data.data ? response.data.data : [];
      cacheTimestamp = now;
    }
    // Filter flights by user city/country and only today's flights
    const today = new Date().toISOString().slice(0, 10);
    const airportIata = nearestAirport?.iataCode?.toUpperCase();
    let relevantFlights;

    if (airportIata) {
      relevantFlights = cachedFlights.filter(f => {
        const flightDate = f.flight_date || '';
        const depIata = (f.departure?.iata || '').toUpperCase();
        const arrIata = (f.arrival?.iata || '').toUpperCase();
        return (
          flightDate === today &&
          (depIata === airportIata || arrIata === airportIata)
        );
      });
    } else {
      // Fallback: show first 10 flights for today, or show a user-friendly error
      relevantFlights = cachedFlights.filter(f => f.flight_date === today).slice(0, 10);
    }
    
    // If we have location data, filter by region
    if (userCity || userCountry) {
      relevantFlights = relevantFlights.filter(f => {
        const depCity = f.departure?.city?.toLowerCase() || '';
        const arrCity = f.arrival?.city?.toLowerCase() || '';
        const depCountry = f.departure?.country?.toLowerCase() || '';
        const arrCountry = f.arrival?.country?.toLowerCase() || '';
        
        return (
          (userCity && (depCity.includes(userCity) || arrCity.includes(userCity))) ||
          (userCountry && (depCountry.includes(userCountry) || arrCountry.includes(userCountry)))
        );
      });
    }
    
    // If no location data or no regional flights found, show some general flights
    if (relevantFlights.length === 0) {
      relevantFlights = cachedFlights.filter(f => {
        const flightDate = f.flight_date || '';
        return flightDate === today;
      }).slice(0, 10); // Show first 10 flights of the day
    }
    // Format response
    const formatted = relevantFlights.map(f => ({
      flight_number: f.flight?.iata || f.flight?.number || '',
      airline: f.airline?.name || '',
      departure_city: f.departure?.city || '',
      departure_airport: f.departure?.airport || '',
      departure_iata: f.departure?.iata || '',
      arrival_city: f.arrival?.city || '',
      arrival_airport: f.arrival?.airport || '',
      arrival_iata: f.arrival?.iata || '',
      departure_time: f.departure?.scheduled || '',
      arrival_time: f.arrival?.scheduled || '',
      terminal: f.departure?.terminal || f.arrival?.terminal || '',
      status: f.flight_status || ''
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

export default router; 