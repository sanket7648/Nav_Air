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
  let lastTimestamp = timestamps['Checked In'];
  for (let i = 1; i < STATUS_EVENTS.length; i++) {
    const event = STATUS_EVENTS[i];
    const eventTime = timestamps[event];
    if (eventTime && now >= eventTime) {
      currentStatus = event;
      lastTimestamp = eventTime;
      confidence = Math.max(0.5, 1 - (now - eventTime) / (1000 * 60 * 60));
    } else {
      break;
    }
  }
  return { currentStatus, confidence: +confidence.toFixed(2), lastTimestamp };
}

// Helper: Simulate status progression
function simulateStatusTimestamps() {
  const now = Date.now();
  const interval = 2 * 60 * 1000; // 2 minutes between events
  const timestamps = {};
  STATUS_EVENTS.forEach((event, idx) => {
    timestamps[event] = now + idx * interval;
  });
  return timestamps;
}

// POST /baggage - Create new baggage
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { bagId, flightNumber, carouselNumber } = req.body;
    const newBagId = bagId || Math.random().toString(36).substring(2, 12).toUpperCase();
    const timestamps = simulateStatusTimestamps();
    await query(
      'INSERT INTO baggage (bag_id, flight_number, carousel_number, timestamps) VALUES ($1, $2, $3, $4)',
      [newBagId, flightNumber, carouselNumber, JSON.stringify(timestamps)]
    );
    res.status(201).json({ bagId: newBagId, flightNumber, carouselNumber, timestamps });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create baggage', error: err.message });
  }
});

// PATCH /baggage/:bagId/status - Update baggage status
router.patch('/:bagId/status', authenticateToken, async (req, res) => {
  try {
    const { bagId } = req.params;
    const { status } = req.body;
    if (!STATUS_EVENTS.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const result = await query('SELECT * FROM baggage WHERE bag_id = $1', [bagId]);
    if (result.length === 0) return res.status(404).json({ message: 'Baggage not found' });
    const baggage = result[0];
    const timestamps = baggage.timestamps;
    timestamps[status] = Date.now();
    await query('UPDATE baggage SET timestamps = $1 WHERE bag_id = $2', [JSON.stringify(timestamps), bagId]);
    res.json({ message: 'Status updated', bagId, status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
});

// GET /baggage/:bagId - Get baggage status
router.get('/:bagId', authenticateToken, async (req, res) => {
  try {
    const { bagId } = req.params;
    const result = await query('SELECT * FROM baggage WHERE bag_id = $1', [bagId]);
    if (result.length === 0) return res.status(404).json({ message: 'Baggage not found' });
    const baggage = result[0];
    const progression = getStatusProgression(baggage.timestamps);
    res.json({
      bagId: baggage.bag_id,
      flightNumber: baggage.flight_number,
      carouselNumber: baggage.carousel_number,
      timestamps: baggage.timestamps,
      ...progression
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch baggage', error: err.message });
  }
});

// GET /baggage - List all baggage
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM baggage');
    const baggages = result.map(baggage => {
      const progression = getStatusProgression(baggage.timestamps);
      return {
        bagId: baggage.bag_id,
        flightNumber: baggage.flight_number,
        carouselNumber: baggage.carousel_number,
        timestamps: baggage.timestamps,
        ...progression
      };
    });
    res.json(baggages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch baggages', error: err.message });
  }
});

// DELETE /baggage/:bagId - Delete baggage
router.delete('/:bagId', authenticateToken, async (req, res) => {
  try {
    const { bagId } = req.params;
    await query('DELETE FROM baggage WHERE bag_id = $1', [bagId]);
    res.json({ message: 'Baggage deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete baggage', error: err.message });
  }
});

export default router;
