
import express from 'express';
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  updateBookingStatus,
  getBookingDetails,
  deleteBooking
} from '../Controller/bookingController.js';

const router = express.Router();

// POST: Create new booking (after payment)
router.post('/create', createBooking);

// GET: Get user's bookings
router.get('/user/:userId', getUserBookings);

// GET: Get host's bookings
router.get('/host/:hostId', getHostBookings);

// GET: Get single booking details
router.get('/:bookingId', getBookingDetails);

// PUT: Update booking status
router.put('/update/:bookingId', updateBookingStatus);

// DELETE: Delete booking (for emergencies)
router.delete('/delete/:bookingId', deleteBooking);

export default router;