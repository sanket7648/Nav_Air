// sanket7648/nav_air/Nav_Air-829cba947a0fef3ed62fd6d062b82f00dfe48634/backend/routes/flights.js
import express from 'express';
import aviationStack from '../services/flightScraper.js';
import { mockFlightsDatabase } from '../data/mockFlights.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { flight_iata, dep_iata, arr_iata, airline_iata, status } = req.query;

    const queryParams = {
      flight_iata,
      dep_iata,
      arr_iata,
      airline_iata,
      flight_status: status,
    };

    // Remove undefined parameters
    Object.keys(queryParams).forEach((key) => queryParams[key] === undefined && delete queryParams[key]);

    console.log('Fetching flights with params:', queryParams);

    const result = await aviationStack.getFlights(queryParams);

    // Ensure we have a valid result with data
    if (!result || !result.data || !Array.isArray(result.data)) {
      console.error('Invalid response format:', result);
      return res.status(404).json({
        success: false,
        message: 'No flight data available',
      });
    }

    // Log the successful response
    console.log(`Successfully retrieved ${result.data.length} flights`);

    return res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error in /api/flights:', error);
    // If the error indicates a rate limit issue, send a 429 status code
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'AviationStack API rate limit exceeded. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve flight data',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
    });
  }
});

router.get('/mock', (req, res) => {
  res.json(mockFlightsDatabase);
});

export default router;