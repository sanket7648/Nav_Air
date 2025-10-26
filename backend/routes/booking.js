import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

/**
 * POST /api/booking
 * Creates a new slot booking record in the database.
 * Requires authentication.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // serviceType will be the user-friendly name, e.g., 'Arrival Time Slot'
    const { serviceType, bookingDate, bookingTime } = req.body;
    // req.user is set by authenticateToken middleware
    const userId = req.user.id;
    const username = req.user.username;
    const email = req.user.email;       
    
    // Simple validation
    if (!serviceType || !bookingDate || !bookingTime) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: serviceType, bookingDate, or bookingTime' 
      });
    }

    // Generate a unique booking ID (e.g., using part of a UUID)
    const bookingId = `BK${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create the data payload that will be embedded in the QR Code
    const qrCodeData = JSON.stringify({
      bookingId,
      service: serviceType,
      date: bookingDate,
      time: bookingTime,
      userId,
      username,
      email,
      issued: new Date().toISOString()
    });

    // Store the booking record
    const result = await query(
      `INSERT INTO slot_bookings (booking_id, user_id, service_type, booking_date, booking_time, qr_code_data)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING booking_id, service_type, booking_date, booking_time, qr_code_data`,
      [bookingId, userId, serviceType, bookingDate, bookingTime, qrCodeData]
    );

    const newBooking = result.rows[0];

    res.status(201).json({ 
      success: true,
      message: 'Booking created successfully',
      bookingId: newBooking.booking_id,
      serviceType: newBooking.service_type,
      bookingDate: newBooking.booking_date,
      bookingTime: newBooking.booking_time,
      qrCodeData: newBooking.qr_code_data
    });

  } catch (err) {
    console.error('Failed to create booking:', err);
    res.status(500).json({ 
        success: false,
        message: 'Internal server error while creating booking', 
        error: err.message 
    });
  }
});

// <<< START: NEW ROUTE to get bookings for the current user >>>
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await query(
      'SELECT booking_id, service_type, booking_date, booking_time, status, created_at FROM slot_bookings WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Failed to fetch user bookings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch booking records', error: err.message });
  }
});
// <<< END: NEW ROUTE >>>

export default router;