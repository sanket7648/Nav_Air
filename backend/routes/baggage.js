import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Baggage status events in order
const STATUS_EVENTS = [
  'Checked In',
  'Security Cleared',
  'Loaded on Aircraft',
  'In Transit',
  'At Carousel',
  'Ready for Pickup',
];

// Helper: Get current status based on timestamps
function getStatusProgression(timestamps) {
  const now = Date.now();
  let currentStatus = 'Checked In';
  let confidence = 1.0;
  // Ensure 'Checked In' timestamp exists before proceeding
  let lastTimestamp = timestamps && timestamps['Checked In'] ? timestamps['Checked In'] : now;

  // Check timestamps safely
  if (timestamps && typeof timestamps === 'object') {
      for (let i = 1; i < STATUS_EVENTS.length; i++) {
          const event = STATUS_EVENTS[i];
          const eventTime = timestamps[event];
          if (eventTime && now >= eventTime) {
              currentStatus = event;
              lastTimestamp = eventTime;
              // Simple confidence calculation (adjust as needed)
              confidence = Math.max(0.5, 1 - (now - eventTime) / (1000 * 60 * 60)); // Decreases over 1 hour
          } else {
              break; // Stop if a timestamp is missing or in the future
          }
      }
  } else {
      console.warn("Invalid timestamps object received in getStatusProgression:", timestamps);
      // Fallback or default status if timestamps are invalid
      currentStatus = 'Unknown';
      lastTimestamp = now;
      confidence = 0.0;
  }
  return { currentStatus, confidence: +confidence.toFixed(2), lastTimestamp };
}


// POST /baggage - Create new baggage
router.post('/', authenticateToken, async (req, res) => {
  try {
    // --- SOLUTION: Capture userId immediately and validate ---
    const userId = req.user?.id; // Use optional chaining

    if (!userId) {
        // This check guards against unexpected issues after authenticateToken.
        console.error('CRITICAL ERROR in POST /baggage: req.user.id is missing immediately after authenticateToken!');
        return res.status(500).json({ success: false, message: 'Authentication context was lost.' });
    }
    // --- End Solution ---

    const { bagId, flightNumber, carouselNumber } = req.body;
    const newBagId = bagId || Math.random().toString(36).substring(2, 12).toUpperCase();
    const now = Date.now();
    // Ensure the initial timestamp structure is correct JSON
    const timestamps = { 'Checked In': now };

    // Database insert (using the validated userId)
    await query(
      'INSERT INTO baggage (bag_id, user_id, flight_number, carousel_number, timestamps, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [newBagId, userId, flightNumber, carouselNumber, JSON.stringify(timestamps)] // Stringify timestamps here
    );

    // Send success response
    res.status(201).json({
        bagId: newBagId,
        userId: userId, // Use the captured userId
        flightNumber: flightNumber,
        carouselNumber: carouselNumber,
        timestamps: timestamps // Return the object, not the stringified version
    });

  } catch (err) {
    // General error handling
    console.error(`Error caught in POST /baggage handler (UserID Attempted: ${req.user?.id || 'undefined'}):`, err);
    res.status(500).json({ success: false, message: 'Failed to create baggage', error: err.message });
  }
});

// PATCH /baggage/:bagId/status - Update baggage status
router.patch('/:bagId/status', authenticateToken, async (req, res) => {
  try {
    const { bagId } = req.params;
    const { status } = req.body;

    if (!STATUS_EVENTS.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    // Fetch the current timestamps
    const result = await query('SELECT timestamps FROM baggage WHERE bag_id = $1', [bagId]);
    if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: 'Baggage record not found.' });
    }

    let timestamps = result.rows[0].timestamps;
    // Ensure timestamps is an object (it should be JSONB from DB)
    if (typeof timestamps === 'string') {
        try {
            timestamps = JSON.parse(timestamps);
        } catch (e) {
             console.error(`Failed to parse timestamps for bag ${bagId} during status update:`, e);
             return res.status(500).json({ message: 'Internal error processing baggage data.' });
        }
    }
    if (typeof timestamps !== 'object' || timestamps === null) {
        timestamps = {}; // Initialize if invalid
    }


    // Update the specific status timestamp
    timestamps[status] = Date.now();

    // Save back to the database
    await query('UPDATE baggage SET timestamps = $1 WHERE bag_id = $2', [JSON.stringify(timestamps), bagId]); // Stringify for DB if needed

    res.json({ message: 'Status updated successfully', bagId, status, timestamp: timestamps[status] });
  } catch (err) {
     console.error(`Error updating status for bag ${req.params.bagId}:`, err);
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});

// --- CORRECT ORDER ---
// GET /baggage/my-baggage - Get baggage for the current user (DEFINED FIRST)
router.get('/my-baggage', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id; // Use optional chaining for safety
    if (!userId) {
        console.error('GET /my-baggage: User ID missing after authentication!');
        return res.status(401).json({ success: false, message: 'User ID not found in token.'});
    }

    console.log(`GET /my-baggage: Querying database for user_id: ${userId}`);

    const result = await query('SELECT * FROM baggage WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    console.log(`GET /my-baggage: Found ${result.rows?.length || 0} rows for user_id: ${userId}`);


    const baggages = result.rows.map(baggage => {
       let timestamps = baggage.timestamps;
       if (typeof timestamps === 'string') {
           try {
               timestamps = JSON.parse(timestamps);
           } catch (e) {
               console.error("Failed to parse timestamps for bag:", baggage.bag_id, e);
               timestamps = { 'Checked In': baggage.created_at ? new Date(baggage.created_at).getTime() : Date.now() }; // Fallback
           }
       }
       // Ensure timestamps is an object
       const validTimestamps = (typeof timestamps === 'object' && timestamps !== null) ? timestamps : { 'Checked In': baggage.created_at ? new Date(baggage.created_at).getTime() : Date.now() };

       // Calculate current status for the list view
       const { currentStatus, confidence, lastTimestamp } = getStatusProgression(validTimestamps);

       return {
         bagId: baggage.bag_id,
         flightNumber: baggage.flight_number,
         carouselNumber: baggage.carousel_number,
         timestamps: validTimestamps, // Send the parsed object
         createdAt: baggage.created_at,
         currentStatus, // Include calculated status
         confidence,
         lastTimestamp
       };
    });
    res.json({ success: true, data: baggages });
  } catch (err) {
    console.error('Failed to fetch user baggage:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch baggage records', error: err.message });
  }
});

// GET /baggage/:bagId - Get specific baggage status (DEFINED AFTER /my-baggage)
router.get('/:bagId', authenticateToken, async (req, res) => {
  try {
    const bagId = req.params.bagId.trim();
    const result = await query('SELECT * FROM baggage WHERE bag_id = $1', [bagId]);

    // Check if result.rows exists and has content
    if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ message: 'Baggage not found' });
    }
    const baggage = result.rows[0];

    // Parse timestamps if needed (should come as object from JSONB)
    let timestamps = baggage.timestamps;
     if (typeof timestamps === 'string') {
        try {
            timestamps = JSON.parse(timestamps);
        } catch (e) {
             console.error(`Failed to parse timestamps for bag ${bagId} during GET:`, e);
             // Assign a default structure or handle error appropriately
             timestamps = { 'Checked In': Date.now() }; // Example fallback
        }
    }
    // Ensure timestamps is a valid object
     if (typeof timestamps !== 'object' || timestamps === null || !timestamps["Checked In"]) {
        console.warn(`Invalid or missing 'Checked In' timestamp for bag ${bagId}. Using defaults.`);
        // Provide a minimal valid structure if necessary
        timestamps = { 'Checked In': baggage.created_at ? new Date(baggage.created_at).getTime() : Date.now(), ...timestamps };
    }


    // --- Simulate Progression (Optional - Keep or remove based on your needs) ---
    const now = Date.now();
    const interval = 2 * 60 * 1000; // 2 minutes (adjust simulation speed)
    let updatedTimestamps = { ...timestamps }; // Work on a copy
    let madeUpdate = false;

    // Iterate through statuses to see if simulation should add next step
    for (let i = 0; i < STATUS_EVENTS.length - 1; i++) {
        const currentEvent = STATUS_EVENTS[i];
        const nextEvent = STATUS_EVENTS[i + 1];

        // If current event exists but next one doesn't
        if (updatedTimestamps[currentEvent] && !updatedTimestamps[nextEvent]) {
            const simulatedNextTime = updatedTimestamps[currentEvent] + interval;
            // If enough time has passed according to simulation
            if (now >= simulatedNextTime) {
                updatedTimestamps[nextEvent] = simulatedNextTime;
                madeUpdate = true;
            } else {
                 break; // Don't simulate further if time hasn't passed
            }
        } else if (!updatedTimestamps[currentEvent]) {
             break; // Stop if a status in the sequence is missing
        }
    }

    // If simulation added new timestamps, save back to DB
    if (madeUpdate) {
        console.log(`Simulating status update for bag ${bagId}. New timestamps:`, updatedTimestamps);
        await query('UPDATE baggage SET timestamps = $1 WHERE bag_id = $2', [JSON.stringify(updatedTimestamps), bagId]);
        timestamps = updatedTimestamps; // Use the updated timestamps for response
    }
    // --- End Simulation ---


    // Calculate current status based on the latest valid timestamps
    const { currentStatus, confidence, lastTimestamp } = getStatusProgression(timestamps);

    res.json({
      bagId: baggage.bag_id,
      flightNumber: baggage.flight_number,
      carouselNumber: baggage.carousel_number,
      timestamps: timestamps, // Return the potentially updated timestamps
      currentStatus,
      confidence,
      lastTimestamp
    });
  } catch (err) {
     console.error(`Failed to fetch baggage ${req.params.bagId}:`, err);
    res.status(500).json({ message: 'Failed to fetch baggage status', error: err.message });
  }
});
// --- END CORRECT ORDER ---


// GET /baggage - List all baggage (Consider restricting access in production)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // WARNING: In a real app, you might want to restrict this or add pagination
    const result = await query('SELECT * FROM baggage ORDER BY created_at DESC'); // Order might be useful

    const baggages = result.rows.map(baggage => { // Use result.rows
        let timestamps = baggage.timestamps;
        if (typeof timestamps === 'string') {
             try {
                 timestamps = JSON.parse(timestamps);
             } catch (e) {
                  console.error("Failed to parse timestamps for bag:", baggage.bag_id, e);
                  timestamps = { 'Checked In': baggage.created_at ? new Date(baggage.created_at).getTime() : Date.now() };
             }
        }
       const validTimestamps = (typeof timestamps === 'object' && timestamps !== null) ? timestamps : { 'Checked In': baggage.created_at ? new Date(baggage.created_at).getTime() : Date.now() };
       const { currentStatus, confidence, lastTimestamp } = getStatusProgression(validTimestamps);

       return {
         bagId: baggage.bag_id,
         flightNumber: baggage.flight_number,
         carouselNumber: baggage.carousel_number,
         timestamps: validTimestamps,
         createdAt: baggage.created_at,
         currentStatus,
         confidence,
         lastTimestamp
       };
    });
    res.json({ success: true, data: baggages }); // Standardize response format
  } catch (err) {
    console.error('Failed to fetch all baggages:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch baggage list', error: err.message });
  }
});


// DELETE /baggage/:bagId - Delete baggage
router.delete('/:bagId', authenticateToken, async (req, res) => {
  try {
    const { bagId } = req.params;
    // Optional: Check if the user owns this baggage before deleting
    // const userId = req.user.id;
    // const check = await query('SELECT user_id FROM baggage WHERE bag_id = $1', [bagId]);
    // if (!check.rows || check.rows.length === 0 || check.rows[0].user_id !== userId) {
    //    return res.status(403).json({ success: false, message: 'Forbidden: You do not own this baggage record.' });
    // }

    const result = await query('DELETE FROM baggage WHERE bag_id = $1 RETURNING bag_id', [bagId]);

    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Baggage record not found for deletion.' });
    }

    res.json({ success: true, message: `Baggage record ${bagId} deleted successfully.` });
  } catch (err) {
    console.error(`Failed to delete baggage ${req.params.bagId}:`, err);
    res.status(500).json({ success: false, message: 'Failed to delete baggage record', error: err.message });
  }
});


export default router;