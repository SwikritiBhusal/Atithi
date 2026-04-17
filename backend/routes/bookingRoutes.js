
import express from 'express';
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  getHostRevenue,
  downloadHostRevenueReport,
  updateBookingStatus,
  getBookingDetails,
   cancelBooking,
  // getCancellationDetails,
  deleteBooking
} from '../Controller/bookingController.js';
import userAuth from '../Middleware/auth.middleware.js';

const router = express.Router();

// POST: Create new booking (after payment)
router.post('/create', createBooking);

// GET: Get user's bookings
router.get('/user/:userId', getUserBookings);

// GET: Get host's bookings
router.get('/host/:hostId', getHostBookings);

// GET: Host revenue summary
router.get('/host/:hostId/revenue', getHostRevenue);

// GET: Host revenue PDF report
router.get('/host/:hostId/revenue/report', downloadHostRevenueReport);

// GET: Get single booking details
router.get('/:bookingId', getBookingDetails);

// PUT: Update booking status
router.put('/update/:bookingId', updateBookingStatus);

//  CANCEL BOOKING (requires auth)
router.put('/cancel/:bookingId', userAuth, cancelBooking);
 
// Get cancellation details
// router.get('/cancellation/:bookingId', getCancellationDetails);

// DELETE: Delete booking (for emergencies)
router.delete('/delete/:bookingId', deleteBooking);

export default router;
